import * as bcrypt from "bcrypt"
import {
    futureDateFromNow,
    randomString
} from "../../libs/utilities"
import {
    Chat,
    EmailLink,
    Friend,
    Notification,
    ShoppingList,
    User
} from "../../models"

import { DecodedTokenType } from "../../libs/jwt.token"
import { RBAC } from "../../libs/rbac"
import {
    IUser,
    SignUp
} from "../../models/schemas/user"
import { TemplateEmail } from "../../libs/mailer/templates"
import { IChat } from "../../models/schemas/chat"
import { Pagination } from "../../libs/pagination"

import {
    MongooseDuplicateError,
    MongooseValidationError
} from "../../libs/custom.errors"
import { newUser } from "./utils.user.controller"
import { UpdateCredential } from "../../middlewares/user"
import isAlreadyLoggedOut = IUser.isAlreadyLoggedOut
import Role = RBAC.Role

const clientOrigin = configuration.externalOriginOf("client") // configuration.client.origin

function sendEmailSignup(user: IUser) {
    const randomKey: string = randomString()
    const pathname = "/end-signup"
    const emailLink = new EmailLink({
        userID: user.credential.userID,
        email: user.information.email,
        expired: futureDateFromNow(1440), // 24 ore
        link: pathname,
        randomKey
    })
    emailLink
        .save()
        .then(() => {
            const signUpEmail: TemplateEmail = TemplateEmail.createSignUpEmail({
                appName,
                firstname: user.information.firstname,
                lastname: user.information.lastname,
                email: user.information.email,
                userID: user.credential.userID,
                url: clientOrigin + pathname + "?key=" + randomKey + "&email=" + user.information.email + "&userID=" + user.credential.userID
            })

            mailer.send({
                to: user.information.email,
                subject: configuration.appName + " - Registrazione"
            }, signUpEmail, { savedJSON: { filename: `signup-${user._id}` } /* FOR DEVELOP */ })
        }, err => console.error(err.message))
}

export function createUser(req, res) {
    newUser(req, { role: Role.SIGNED })
        .save()
        .then(user => {
            res.status(201).json({ userID: user._id })
            if (accessManager.isSignedUser(user.credential)) sendEmailSignup(user)
        }, err => {
            if (MongooseValidationError.is(err)) return res.status(400).json({ description: err.message })
            if (MongooseDuplicateError.is(err)) {
                console.debug(err.message)
                const fieldExpected: string = (err.message.match(/email|userID/) || ["user"])[0]
                return res.status(409).json({ description: fieldExpected.capitalize() + " has been already used", details: { field: fieldExpected } })
            }
            res.status(500).json({ code: 0, description: err.message })
        })
}

function infoUsers(users: IUser[], me: DecodedTokenType): object[] {
    const usersObject = users.map(u => u.toObject())
    if (accessManager.isAdminUser(me)) {
        console.debug("like admin")
        return usersObject.map(u => {
            const userInfo = { userID: u.credential.userID, role: u.credential.role }
            delete u.credential
            return { ...u, ...userInfo }
        })
    } else {
        console.debug("like " + (me ? "signed" : "anonymous"))
        return usersObject.map(u => {
            const userInfo = { userID: u.credential.userID, role: u.credential.role }
            delete u.credential
            delete u.strike
            return { ...u, ...userInfo }
        })
    }
}
export function allUsers(req, res) {
    const { page, limit } = req.query
    const user = req.locals.user

    const filters = req.locals.filters
    if (!accessManager.isAdminUser(user)) filters.signup = SignUp.State.CHECKED
    if (user) filters._id = { $ne: user._id }
    console.debug(JSON.stringify(filters, null, 2))

    Pagination.ofQueryDocument(
        User.find(filters)
            .collation({ locale: "en" } /* sort case-insensitive */)
            .sort({ "credential.userID": 1 }),
        page && limit ? { page: +page, limit: +limit } : undefined
    )
        .then(
            result => res.status(200).json(Object.assign(result, { items: infoUsers(result.items as IUser[], user) })),
            err => res.status(500).json({ description: err.message })
        )
}

export function checkAccount(req, res) {
    const { email, userID, key } = req.body
    EmailLink
        .findOne()
        .where("link", "/end-signup")
        .where("randomKey")
        .equals(key)
        .where("email")
        .equals(email)
        .where("userID")
        .equals(userID)
        .then(emailLink => {
            if (!emailLink) return res.status(404).json({ description: "Link not valid" })

            if (emailLink.expired < Date.now()) {
                emailLink
                    .delete()
                    .then(
                        () => console.debug("Remove expired email link for signup."),
                        err => console.error("ERROR on remove expired email link for signup. Reason: ", err)
                    )
                return res.status(410).json({ description: "Link expired" })
            }

            User.findOne()
                .where("credential.userID")
                .equals(userID)
                .then(user => {
                    if (!user) return res.status(404).json({ description: "User not found" })
                    if (SignUp.State.isChecked(user.signup)) return res.status(200).json({ just_check_account: true })
                    if (SignUp.State.isPending(user.signup)) {
                        user.signup = SignUp.State.CHECKED
                        user.save()
                            .then(
                                () => res.status(200).json({ _id: user._id, check_account: true }),
                                e => res.status(500).json({ check_account: false, description: e.message })
                            )
                    }
                }, err => res.status(500).json({ description: err.message }))
        }, err => res.status(500).json({ description: err.message }))
}

// (optional) use token
export function oneUser(req, res) {
    const { id } = req.params
    const decodedToken = req.locals.user

    User.findOne()
        .where("signup")
        .equals(SignUp.State.CHECKED)
        .where("_id")
        .equals(id)
        .then(user => {
            if (!user) return res.status(404).json({ description: "User is not found" })
            const isSigned = accessManager.isSignedUser(user.credential) ? true : undefined
            const isAdmin = accessManager.isAdminUser(user.credential) ? true : undefined
            const userO = user.toObject()
            if (!decodedToken || decodedToken._id !== id) {
                delete userO.information.email
                delete userO.information.tel_number
            }
            res.status(200).json({
                information: userO.information,
                userID: user.credential.userID,
                isSigned,
                isAdmin,
                _id: user._id
            })

        }, err => res.status(500).json({ description: err.message }))
}

// use token
export function updateUser(req, res) {
    const { id } = req.params
    const userBody = req.body

    User.findOne()
        .where("signup")
        .equals(SignUp.State.CHECKED)
        .where("_id")
        .equals(id)
        .then(user => {
            if (!user) return res.status(404).json({ description: "User is not found" })
            if (isAlreadyLoggedOut(user)) return res.status(401).json({ description: "User is not authenticated" })
            user.information = Object.assign(user.information, userBody)
            user.save()
                .then(
                    u => res.status(200).json({ update: true, info: u.information }),
                    err => {
                        if (MongooseValidationError.is(err)) return res.status(400).json({ description: err.message })
                        return res.status(500).json({ description: err.message })
                    }
                )
        }, err => res.status(500).json({ description: err.message }))
}

function deleteUserRef(user: IUser): void {
    const userID: string = user.credential.userID
    ShoppingList
        .deleteOne()
        .where("user")
        .equals(user._id)
        .then(
            result => console.debug("Delete shopping list of user ", userID, " : ", result),
            err => console.error("Delete shopping list of user ", userID, " : ", err)
        )

    Notification
        .deleteMany()
        .where("user")
        .in([user._id, user._id.toString()])
        .then(
            result => console.debug("Delete notifications of user ", userID, " : ", result),
            err => console.error("Delete notifications of user ", userID, " : ", err)
        )

    Friend
        .deleteMany({ $or: [{ from: { $eq: user._id } }, { to: { $eq: user._id } }] })
        .where("user")
        .in([user._id, user._id.toString()])
        .then(
            result => console.debug("Delete friendships of user ", userID, " : ", result),
            err => console.error("Delete friendships of user ", userID, " : ", err)
        )

    Chat.deleteMany()
        .where("chat.info")
        .equals(IChat.Type.ONE)
        .where("users.user")
        .equals(user._id)
        .then(
            result => console.debug("Delete chats one of user ", userID, " : ", result),
            err => console.error("Delete chats one  of user ", userID, " : ", err)
        )

    Chat.find()
        .where("chat.info")
        .equals(IChat.Type.GROUP)
        .where("users.user")
        .equals(user._id)
        .then(chats => {
            if (chats.length === 0) return console.error("Delete chats one  of user ", userID, " : Chat not found.")
            for (const chat of chats) {
                const index = chat.users.findIndex(r => r.user._id == user._id)
                if (index !== -1) {
                    const chatWithAdmin = chat.users.filter(u => Role.ADMIN == u.user.role)
                    if (chatWithAdmin.length == chat.users.length - 1) {
                        chat.remove()
                            .then(
                                result => console.debug("Delete chat group with admins of ", userID, " : ", result),
                                err => console.error("Delete chat group with admins of ", userID, " : ", err)
                            )
                    } else {
                        chat.users.splice(index, 1)
                        chat.save()
                            .then(
                                result => console.debug("Delete user " + userID + " on chat group (" + chat._id + ") : ", result),
                                err => console.error("Delete user " + userID + " on chat group (" + chat._id + ") : ", err)
                            )
                    }
                } else console.error("User not found in chat = ", chat._id)
            }
        }, err => console.error("Delete chats one  of user ", userID, " : ", err))
}
function sendEmailEraseUser(user: IUser): void {
    const eraseUserEmail: TemplateEmail = TemplateEmail.createEraseUserEmail({
        appName,
        firstname: user.information.firstname,
        lastname: user.information.lastname,
        userID: user.credential.userID,
        email: user.information.email
    })
    mailer.send({
        to: user.information.email,
        subject: configuration.appName + " - Cancellazione account"
    }, eraseUserEmail, { savedJSON: { filename: `erase-user-${user._id}` } /* FOR DEVELOP */ })
}
// use token
export function deleteUser(req, res) {
    const { id } = req.params
    const decodedToken = req.locals.user

    function deleteUser(id: string) {
        const query = User.findOne()
            .where("_id")
            .equals(id)

        if (!accessManager.isAdminUser(decodedToken)) query.where("signup").equals(SignUp.State.CHECKED)

        query
            .then(user => {
                if (!user) return res.status(404).json({ description: "User not found" })
                if (accessManager.isSignedUser(decodedToken) && isAlreadyLoggedOut(user)) {
                    return res.status(401).json({ description: "User is not authenticated" })
                }
                user.remove()
                    .then(removedUser => {
                        res.status(200).json({ delete: true })
                        sendEmailEraseUser(removedUser)
                        deleteUserRef(removedUser)
                    }, err => res.status(500).json({ description: err.message }))
            }, err => res.status(500).json({ description: err.message }))
    }

    if (accessManager.isAdminUser(decodedToken)) {
        User.findOne()
            .where("credential.role")
            .equals(Role.ADMIN)
            .where("_id")
            .equals(id)
            .then(admin => {
                if (isAlreadyLoggedOut(admin)) return res.status(401).json({ description: "User is not authenticated" })
                return deleteUser(id)
            }, err => res.status(500).json({ description: err.message }))
    } else deleteUser(id)
}

// use token
export function updateCredentialUser(req, res) {
    const { id } = req.params
    const { change, reset } = req.query
    const { old_userID: oldUserID, new_userID: newUserID, old_password: oldPassword, new_hash_password: newHashPassword } = req.body

    User.findOne()
        .where("signup")
        .equals(SignUp.State.CHECKED)
        .where("_id")
        .equals(id)
        .then(user => {
            if (!user) return res.status(404).json({ description: "User is not found" })
            switch (change) {
                case UpdateCredential.USERID: {
                    if (user.credential.userID === oldUserID) {
                        user.credential.userID = newUserID
                        user.save()
                            .then(
                                () => res.status(200).json({ update: change }),
                                err => res.status(500).json({ description: err.message })
                            )
                    } else return res.status(409).json({ description: "Old UserID is incorrect" })
                }
                    break
                case UpdateCredential.PASSWORD: {
                    const result = reset || bcrypt.compareSync(oldPassword, user.credential.hash_password)
                    if (result) {
                        user.credential.hash_password = newHashPassword
                        user.save()
                            .then(
                                () => res.status(200).json({ update: change }),
                                err => res.status(500).json({ description: err.message })
                            )
                    } else return res.status(409).json({ description: "Old Password is incorrect" })
                }
                    break
            }
        }, err => res.status(500).json({ description: err.message }))
}

export function checkLinkResetPassword(req, res) {
    EmailLink
        .findOne()
        .where("link")
        .equals("/reset-password")
        .where("randomKey")
        .equals(req.query.key)
        .then(emailLink => {
            if (!emailLink) return res.status(404).json({ description: "Key not valid" })
            if (emailLink.expired < Date.now()) {
                emailLink
                    .delete()
                    .then(
                        () => console.debug("Remove expired email link for reset password."),
                        err => console.error("ERROR on remove expired email link for reset password. Reason: ", err)
                    )
                return res.status(410).json({ description: "Link expired" })
            } else return res.status(200).json({ description: "Link valid" })
        }, err => res.status(500).json({ description: err.message }))
}

export function foundUserForNickname(req, res) {
    const { nickname, key } = req.query
    Promise.all([
        EmailLink
            .findOne()
            .where("link")
            .equals("/reset-password")
            .where("randomKey")
            .equals(key)
            .where("userID")
            .equals(nickname),
        User
            .findOne()
            .where("credential.userID")
            .equals(nickname)
            .where("signup")
            .equals(SignUp.State.CHECKED)
    ])
        .then(results => {
            const [emailLink, user] = results
            if (!user) return res.status(404).json({ description: "User is not found" })
            if (!emailLink) return res.status(404).json({ description: "Request is not found" })
            const token = tokensManager.createToken({ _id: user._id, userID: user.credential.userID, role: user.credential.role }, "5 minutes")
            res.status(200).json({ temporary_token: token, _id: user._id })
        }, err => res.status(500).json({ description: err.message }))
}

// SEND EMAIL
export function sendEmailPassword(req, res) {
    const { email } = req.query
    User.findOne()
        .where("signup")
        .equals(SignUp.State.CHECKED)
        .where("information.email")
        .equals(email)
        .then(user => {
            if (!user) return res.status(404).json({ description: "Email is not associated with any account" })

            const randomKey: string = randomString()
            const pathname = "/reset-password"

            const emailLink = new EmailLink({
                email,
                userID: user.credential.userID,
                expired: futureDateFromNow(30),
                link: pathname,
                randomKey
            })
            emailLink.save()
                .then(() => {
                    res.status(200).json({ send: true })

                    const resetPswEmail: TemplateEmail = TemplateEmail.createResetPasswordEmail({
                        appName,
                        user_name: user.information.firstname + " " + user.information.lastname,
                        url: clientOrigin + pathname + "?key=" + randomKey
                    })

                    mailer.send({
                        to: email,
                        subject: configuration.appName + " - Reset Password"
                    }, resetPswEmail, { savedJSON: { filename: `reset-pass-${user._id}` } /* FOR DEVELOP */ })
                }, err => res.status(500).json({ description: err.message }))
        }, err => res.status(500).json({ description: err.message }))
}
