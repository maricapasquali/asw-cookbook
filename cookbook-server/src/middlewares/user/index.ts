import { Types } from "mongoose"
import {
    CallbackNext,
    checkNormalRBAC,
    checkRestrictedRBAC,
    Middlewares
} from "../base"
import { RBAC } from "../../libs/rbac"
import { uploadProfileImage } from "./base"
import { valuesOfEnum } from "../../libs/utilities"
import Operation = RBAC.Operation
import Resource = RBAC.Resource

function checkParamId(req: any, res: any, next: CallbackNext): void {
    const { id } = req.params
    if (!Types.ObjectId.isValid(id)) return next({ status: 400, description: "Required a valid 'id'" })
    next()
}

export function create(): Middlewares {
    return uploadProfileImage()
}

export function allUser(): Middlewares {
    return [
        checkNormalRBAC(),
        function (req, res, next) {
            let { userID, fullname } = req.query

            const searchAvailableValue = ["full", "partial"]

            const filters: any = { "credential.role": RBAC.Role.SIGNED }

            if (userID) {
                try {
                    userID = JSON.parse(userID)
                    if (!userID.search || !userID.value) throw new Error()
                } catch (e) {
                    return next({ status: 400, description: "Parameter 'userID' is malformed. It must be of form: {\"search\": string, \"value\": string}" })
                }

                if (!searchAvailableValue.includes(userID.search)) return next({ status: 400, description: `Parameter 'userID.search' must be in ${searchAvailableValue}.` })
                const regexObject = { $regex: `^${userID.value}`, $options: "i" }
                if (userID.search === "full") regexObject.$regex += "$"
                filters["credential.userID"] = regexObject
            }

            if (fullname) {
                try {
                    fullname = JSON.parse(fullname)
                    if (!fullname.search || !fullname.value) throw new Error()
                } catch (e) {
                    return next({ status: 400, description: "Parameter 'fullname' is malformed.  It must be of form: {\"search\": string, \"value\": string}" })
                }

                if (!searchAvailableValue.includes(fullname.search)) return next({ status: 400, description: `Parameter 'fullname.search' must be in ${searchAvailableValue}.` })
                const regexObject = { $regex: `^${fullname.value}`, $options: "i" }
                if (fullname.search === "full") regexObject.$regex += "$"
                filters.$or = [{ "information.firstname": regexObject }, { "information.lastname": regexObject }]
            }

            req.locals.filters = filters

            next()
        }
    ]
}

export function one(): Middlewares {
    return [
        checkNormalRBAC(),
        checkParamId
    ]
}

export function updateUser(): Middlewares {
    return [
        checkRestrictedRBAC({
            operation: Operation.UPDATE,
            resource: Resource.USER,
            others: (decodedToken, paramId) => decodedToken._id !== paramId
        }),
        checkParamId,
        uploadProfileImage(),
        function (req, res, next) {
            if (Object.keys(req.body).length === 0) return next({ status: 400, description: "Missing body." })
            next()
        }
    ]
}

export enum UpdateCredential {
    USERID = "userID",
    PASSWORD = "password"
}
export namespace UpdateCredential {
    export function values(): UpdateCredential[] {
        return valuesOfEnum(UpdateCredential, "string")
    }

    export function includes(val: string): boolean {
        return UpdateCredential.values()
            .includes(val as UpdateCredential)
    }
}

export function updateCredential():Middlewares {
    return [
        checkRestrictedRBAC({
            operation: Operation.UPDATE,
            resource: Resource.USER_CREDENTIAL,
            others: (decodedToken, paramId) => decodedToken._id !== paramId
        }),
        checkParamId,
        function (req, res, next) {
            const { change, reset } = req.query
            if (!UpdateCredential.includes(change)) return next({ status: 400, description: "Available values: [\"userID\", \"password\"]" })
            const { old_userID: oldUserID, new_userID: newUserID, old_password: oldPassword, new_hash_password: newHashPassword } = req.body
            switch (change as UpdateCredential) {
                case UpdateCredential.USERID:
                    if (!(oldUserID && newUserID)) return next({ status: 400, description: "Update userID: required [old_userID, new_userID] " })
                    break
                case UpdateCredential.PASSWORD:
                    if (!reset && !(oldPassword && newHashPassword)) return next({ status: 400, description: "Update password: required [old_password, new_hash_password] " })
                    break
            }
            next()
        }
    ]
}

export function erase(): Middlewares {
    return [
        checkRestrictedRBAC({
            operation: Operation.DELETE,
            resource: Resource.USER,
            others: (decodedToken, paramId) => decodedToken._id !== paramId
        }),
        checkParamId
    ]
}

// LINKS

export function checkAccount(): Middlewares {
    return function (req, res, next) {
        const { email, userID, key } = req.body
        if (!email || !userID || !key) return next({ status: 400, description: "Require 'email', 'userID', 'key'" })
        next()
    }
}

export function sendEmailPassword(): Middlewares {
    return function (req, res, next) {
        const { email } = req.query
        if (!email) return next({ status: 400, description: "Missing email." })
        if (!EmailValidator.check(email)) return next({ status: 400, description: "Email is not valid." })
        next()
    }
}

export function checkLinkResetPassword(): Middlewares {
    return function (req, res, next) {
        if (!req.query.key) return next({ status: 400, description: "Missing key" })
        next()
    }
}

export function foundUserForNickname(): Middlewares {
    return function (req, res, next) {
        const { nickname, key } = req.query
        if (!nickname) return next({ status: 400, description: "Missing nickname" })
        if (!key) return next({ status: 400, description: "Missing key" })
        next()
    }
}
