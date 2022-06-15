import * as bcrypt from "bcrypt"
import { User } from "../../../models"
import {
    IUser,
    SignUp,
    Strike
} from "../../../models/schemas/user"
import { RBAC } from "../../../libs/rbac"
import { AccessLocker } from "../../../libs/access.locker"
import isAlreadyLoggedOut = IUser.isAlreadyLoggedOut

const locker = new AccessLocker(5, 15) // max attempts 5 & try again in 15 minutes

export function login(req, res) {
    const { userID, password, ip } = req.locals
    if (!locker.checkAttempts(ip))
        return res.status(409).json({ description: "Finished login attempts.", tryAgainIn: locker.getTryAgainInMinutes(ip) })

    User.findOne()
        .where("credential.userID")
        .equals(userID)
        .then(user => {
            if (!user) {
                locker.reduceAttempts(ip)
                return res.status(404).json({ description: "User is not found", remainAttempts: locker.getRemainAttempts(ip) })
            }
            if (SignUp.State.isPending(user.signup)) {
                locker.reduceAttempts(ip)
                return res.status(403).json({ signup: user.signup, description: "User yet to be verified", remainAttempts: locker.getRemainAttempts(ip) })
            }
            if (Strike.isBlocked(user.strike)) {
                locker.reduceAttempts(ip)
                return res.status(403).json({ blocked: true, description: "Blocked account.", remainAttempts: locker.getRemainAttempts(ip) })
            }
            const result = bcrypt.compareSync(password, user.credential.hash_password)
            console.debug("Password is correct = ", result)
            if (result) {
                const firstLogin = accessManager.isAdminUser(user.credential) && user.credential.lastAccess === undefined
                const token = tokensManager.createNewTokens(payloadToken(user, req.id))
                user.credential.lastAccess = 0
                user.save()
                    .then(() => {
                        locker.resetAttempts(ip)

                        tokensManager.tokens(user._id.toString()).append(token)

                        res.status(200).json({
                            token,
                            userInfo: {
                                _id: user._id,
                                userID: user.credential.userID,
                                isSigned: accessManager.isSignedUser(user.credential) ? true : undefined,
                                isAdmin: accessManager.isAdminUser(user.credential) ? true : undefined
                            },
                            firstLogin: firstLogin ? true : undefined
                        })

                    }, err => res.status(500).json({ description: err.message }))
            } else {
                locker.reduceAttempts(ip)
                res.status(403).json({ description: "Password is uncorrected", remainAttempts: locker.getRemainAttempts(ip) })
            }
        }, err => res.status(500).json({ description: err.message }))
}

export function logout(req, res) {
    const { id } = req.params

    User.findOne()
        .where("signup")
        .equals(SignUp.State.CHECKED)
        .where("_id")
        .equals(id)
        .then(user => {
            if (!user) return res.status(404).json({ description: "User not found" })

            if (isAlreadyLoggedOut(user)) return res.status(204).send()

            user.credential.lastAccess = Date.now()
            user.save()
                .then(() => {
                    tokensManager.tokens(id).revoke({ access: req.locals.access_token })

                    return res.status(200).json({ logout: true })
                }, err => res.status(500).json({ description: err.message }))
        }, err => res.status(500).json({ description: err.message }))
}

export function updateAccessToken(req, res) {
    const { id } = req.params
    const accessToken = req.locals.access_token
    const refreshToken = req.body.refresh_token

    const decodedAToken = tokensManager.checkValidityOfToken(accessToken)
    if (decodedAToken !== false) return res.status(204).send()

    const decodedRToken = tokensManager.checkValidityOfToken(refreshToken)
    if (!decodedRToken) {
        tokensManager.tokens(id).revoke({ refresh: refreshToken })
        return res.status(401).json({ description: "Refresh token was expired. Please make a new signin request" })
    }

    if (!accessManager.isAuthorized(decodedRToken.role, RBAC.Operation.UPDATE, RBAC.Resource.SESSION, decodedRToken._id !== id)) {
        return res.status(403).json({ description: "User is unauthorized to update session." })
    }

    User.findOne()
        .where("signup")
        .equals(SignUp.State.CHECKED)
        .where("_id")
        .equals(id)
        .then(user => {
            if (!user) return res.status(404).json({ description: "User not found" })

            const tokensFolder = tokensManager.tokens(id)
            const _accessToken = tokensFolder.findAccessTokenByRefreshToken(refreshToken) // never undefined
            if (_accessToken === accessToken) {
                const token = tokensManager.createToken(payloadToken(user, req.id))
                tokensFolder.refresh({ access: accessToken, refresh: refreshToken }, { access: token, refresh: refreshToken })
                console.debug("Create new access = ", token)
                return res.status(200).json({ access_token: token })
            }
            console.debug("Retrieve updated access = ", _accessToken)
            return res.status(200).json({ access_token: _accessToken })
        }, err => res.status(500).json({ description: err.message }))
}

function payloadToken(user: IUser, requestId: string): any {
    return { _id: user._id, userID: user.credential.userID, role: user.credential.role, reqId: requestId }
}
