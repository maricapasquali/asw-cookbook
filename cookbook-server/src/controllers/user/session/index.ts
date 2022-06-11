import * as bcrypt from 'bcrypt'
import {User} from "../../../models";
import {SignUp, Strike, IUser} from "../../../models/schemas/user";
import {RBAC} from "../../../libs/rbac";
import {Types} from "mongoose";
import ObjectId = Types.ObjectId
import isAlreadyLoggedOut = IUser.isAlreadyLoggedOut;
import {AccessLocker} from "../../../libs/access.locker";

const locker = new AccessLocker(5, 15) //max attempts 5 & try again in 15 minutes

export function login(req, res){
    const { userID, password, ip } = req.locals
    if(!locker.checkAttempts(ip)) return res.status(409).json({ description: 'Finished login attempts.', tryAgainIn: locker.getTryAgainInMinutes(ip) });

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
                const token = tokensManager.createNewTokens(payloadToken(user, req.id))
                user.credential.lastAccess = 0
                user.save()
                    .then(u => {
                        locker.resetAttempts(ip)

                        tokensManager.tokens(u._id.toString()).append(token)

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

export function logout(req, res){
    const {id} = req.params
    const decoded_token = req.locals.user

    User.findOne()
        .where('signup').equals(SignUp.State.CHECKED)
        .where('_id').equals(id)
        .then(user => {
            if(!user) return res.status(404).json({description: 'User not found'})

            if(isAlreadyLoggedOut(user)) return res.status(204).send()

            user.credential.lastAccess = Date.now()
            user.save().then(() => {

                tokensManager.tokens(decoded_token._id).revoke({access: req.locals.access_token})

                return res.status(200).json({logout: true})
            }, err => res.status(500).send({description: err.message}))

        }, err => res.status(500).json({description: err.message}))
}


export function update_access_token(req, res){
    const { id } = req.params
    const access_token = req.locals.access_token
    const refresh_token = req.body.refresh_token

    let decoded_aToken = tokensManager.checkValidityOfToken(access_token);
    if(decoded_aToken!==false) return res.status(204).send()

    let decoded_rToken = tokensManager.checkValidityOfToken(refresh_token);
    if(!decoded_rToken) {
        tokensManager.tokens(id).revoke({refresh: refresh_token})
        return res.status(401).json({description: 'Refresh token was expired. Please make a new signin request'})
    }

    if(!accessManager.isAuthorized(decoded_rToken.role, RBAC.Operation.UPDATE, RBAC.Resource.SESSION, decoded_rToken._id !== id))
        return res.status(403).json({description: 'User is unauthorized to update session.'})

    User.findOne()
        .where('signup').equals(SignUp.State.CHECKED)
        .where('_id').equals(id)
        .then(user => {
            if(!user) return res.status(404).json({description: 'User not found'})

            let tokensFolder = tokensManager.tokens(id)
            let _accessToken = tokensFolder.findAccessTokenByRefreshToken(refresh_token) //never undefined
            if(_accessToken === access_token) {
                let token = tokensManager.createToken(payloadToken(user, req.id))
                tokensFolder.refresh({access: access_token, refresh: refresh_token}, {access: token, refresh: refresh_token})
                console.debug("Create new access = ", token)
                return res.status(200).json({access_token: token})
            }
            console.debug("Retrieve updated access = ", _accessToken)
            return res.status(200).json({access_token: _accessToken})

        }, err => res.status(500).json({description: err.message}))
}

function payloadToken(user: IUser, requestId: string): any {
    return { _id: user._id, userID: user.credential.userID, role: user.credential.role, reqId: requestId }
}
