import * as bcrypt from 'bcrypt'
import {accessManager, getRestrictedUser, tokensManager, extractAuthorization} from "../../index";
import {User} from "../../../models";
import {SignUp, Strike, IUser} from "../../../models/schemas/user";
import {RBAC} from "../../../modules/rbac";
import Operation = RBAC.Operation;
import Subject = RBAC.Subject;
import {Types} from "mongoose";
import ObjectId = Types.ObjectId
import isAlreadyLoggedOut = IUser.isAlreadyLoggedOut;
import {AccessLocker} from "../../../modules/access.locker";

const locker = new AccessLocker(5, 15) //max attempts 5 & try again in 15 minutes

export function login(req, res){
    const {userID, password} = extractAuthorization(req.headers)
    if(!userID && !password) return res.status(400).json({description: 'userID and password are required.'})
    if(!userID) return res.status(400).json({description: 'userID is required.'})
    if(!password) return res.status(400).json({description: 'password is required.'})

    const ip = req.header('x-forwarded-for') || req.socket?.remoteAddress || req.connection?.remoteAddress;
    if(!locker.checkAttempts(ip)) return res.status(409).json({ description: 'Finished login attempts.', tryAgainIn: locker._maxAttempts });

    User.findOne()
        .where("credential.userID").equals(userID)
        .then(user => {
            if(!user) {
                locker.reduceAttempts(ip)
                return res.status(404).json({ description: 'User is not found', remainAttempts: locker.getRemainAttempts(ip) });
            }
            if(SignUp.State.isPending(user.signup)) {
                locker.reduceAttempts(ip)
                return res.status(403).json({signup: user.signup, description: 'User yet to be verified', remainAttempts: locker.getRemainAttempts(ip)});
            }
            if(Strike.isBlocked(user.strike)) {
                locker.reduceAttempts(ip)
                return res.status(403).json({ blocked: true, description: 'Blocked account.', remainAttempts: locker.getRemainAttempts(ip)})
            }
            const result = bcrypt.compareSync(password, user.credential.hash_password)
            console.debug('Password is correct = ', result)
            if(result) {
                let firstLogin = accessManager.isAdminUser(user.credential) && user.credential.lastAccess === undefined
                const token = tokensManager.createNewTokens({_id: user._id, userID: user.credential.userID, role: user.credential.role})
                user.credential.lastAccess = 0
                user.save()
                    .then(u => {
                        locker.resetAttempts(ip)
                        res.status(200).json({
                            token,
                            userInfo: {
                                _id: u._id,
                                userID: u.credential.userID,
                                isSigned: accessManager.isSignedUser(u.credential)? true : undefined,
                                isAdmin: accessManager.isAdminUser(u.credential)? true : undefined
                            },
                            firstLogin: firstLogin ? true : undefined})
                    }, err => res.status(500).json({description: err.message}))
            }
            else {
                locker.reduceAttempts(ip)
                res.status(403).json({description: 'Password is uncorrected', remainAttempts: locker.getRemainAttempts(ip)});
            }
        }, err => res.status(500).json({description: err.message}))
}

//use token
export function logout(req, res){
    let {id} = req.params
    if(!ObjectId.isValid(id)) return res.status(400).json({ description: 'Required a valid \'id\''})

    const decoded_token = getRestrictedUser(req, res, {
        operation: Operation.DELETE,
        subject: Subject.SESSION,
        others: decodedToken => decodedToken._id !== id
    })
    if(decoded_token){
        User.findOne()
            .where('signup').equals(SignUp.State.CHECKED)
            .where('_id').equals(id)
            .then(user => {
                if(!user) return res.status(404).json({description: 'User not found'})

                const [type, value] = req.headers.authorization.split(' ')
                tokensManager.addInRevokeList(value)

                if(isAlreadyLoggedOut(user)) return res.status(204).send()

                user.credential.lastAccess = Date.now()
                user.save().then(() => res.status(200).json({logout: true}), err => res.status(500).send({description: err.message}))
            }, err => res.status(500).json({description: err.message}))
    }
}

//use token
export function update_access_token(req, res){
    let { id } = req.params
    if(!ObjectId.isValid(id)) return res.status(400).json({ description: 'Required a valid \'id\''})
    let { refresh_token } = req.body
    let { access_token } = extractAuthorization(req.headers)

    if(!access_token) return res.status(400).json({description: 'Missing access token'})
    if(!refresh_token) return res.status(400).json({description: 'Missing refresh token'})

    let decoded_aToken = tokensManager.checkValidityOfToken(access_token);
    if(decoded_aToken!==false) return res.status(204).send()

    if(tokensManager.isInRevokeList(access_token)) tokensManager.addInRevokeList(refresh_token)

    let decoded_rToken = tokensManager.checkValidityOfToken(refresh_token);
    if(!decoded_rToken)
        return res.status(401).json({description: 'Refresh token was expired. Please make a new signin request'})

    if(!accessManager.isAuthorized(decoded_rToken.role, RBAC.Operation.UPDATE, RBAC.Subject.SESSION, decoded_rToken._id !== id))
        return res.status(403).json({description: 'User is unauthorized to update session.'})

    User.findOne()
        .where('signup').equals(SignUp.State.CHECKED)
        .where('_id').equals(id)
        .then(user => {
            if(!user) return res.status(404).json({description: 'User not found'})
            let token = tokensManager.createToken({_id: user._id, userID: user.credential.userID, role: user.credential.role})
            console.debug("create new access = ", token)
            return res.status(200).json({access_token: token})
        }, err => res.status(500).json({description: err.message}))
}