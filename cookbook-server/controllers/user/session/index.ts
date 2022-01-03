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

export function login(req, res){
    const {userID, password} = extractAuthorization(req.headers)
    if(!userID && !password) return res.status(400).json({description: 'userID and password are required.'})
    if(!userID) return res.status(400).json({description: 'userID is required.'})
    if(!password) return res.status(400).json({description: 'password is required.'})
    //TODO: ADD ACCESS CONTROL: NUMERBER ATTEMPS 5
    User.findOne()
        .where("credential.userID").equals(userID)
        .then(user => {
            if(!user) return res.status(404).json({description: 'User is not found'});
            if(SignUp.State.isPending(user.signup)) return res.status(403).json({signup: user.signup, description: 'User yet to be verified'});
            if(Strike.isBlocked(user.strike)) return res.status(403).json({ blocked: true, description: 'Blocked account.'})
            const result = bcrypt.compareSync(password, user.credential.hash_password)
            console.debug('Password is correct = ', result)
            if(result) {
                let firstLogin = accessManager.isAdminUser(user.credential) && user.credential.lastAccess === undefined
                const token = tokensManager.createNewTokens({_id: user._id, userID: user.credential.userID, role: user.credential.role})
                user.credential.lastAccess = 0
                user.save()
                    .then(u =>
                        res.status(200).json({
                            token,
                            userInfo: {
                                _id: u._id,
                                userID: u.credential.userID,
                                isSigned: accessManager.isSignedUser(u.credential)? true : undefined,
                                isAdmin: accessManager.isAdminUser(u.credential)? true : undefined
                            },
                            firstLogin: firstLogin ? true : undefined})
                    ,
                    err => res.status(500).json({description: err.message}))
            }
            else res.status(403).json({description: 'Password is uncorrected'});
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
                if(isAlreadyLoggedOut(user)) return res.status(409).json({ description: 'User is already logged out' })

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
    if(decoded_aToken!==false) return res.status(409).send({description: 'Access token is still valid'})

    let decoded_rToken = tokensManager.checkValidityOfToken(refresh_token);
    if(!decoded_rToken)
        return res.status(401).send({description: 'Refresh token was expired. Please make a new signin request'})

    if(!accessManager.isAuthorized(decoded_rToken.role, RBAC.Operation.UPDATE, RBAC.Subject.SESSION, decoded_rToken._id !== id))
        return res.status(403).send({description: 'User is unauthorized to update session.'})

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