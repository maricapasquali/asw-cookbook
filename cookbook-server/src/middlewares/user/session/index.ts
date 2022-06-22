import { Types } from "mongoose"
import {
    checkRestrictedRBAC,
    extractAuthorization,
    Middlewares
} from "../../base"
import { RBAC } from "../../../libs/rbac"
import Operation = RBAC.Operation
import Resource = RBAC.Resource

export function login(): Middlewares {
    return [
        extractAuthorization(),
        // Check parameters, queries of request
        function (req, res, next) {
            const { userID, password } = req.locals
            if (!userID && !password) return next({ status: 400, description: "userID and password are required." })
            if (!userID) return next({ status: 400, description: "userID is required." })
            if (!password) return next({ status: 400, description: "password is required." })
            req.locals.ip = req.header("x-forwarded-for") || req.socket?.remoteAddress || req.connection?.remoteAddress
            next()
        }
    ]
}

export function logout(): Middlewares {
    return [
        checkRestrictedRBAC({
            operation: Operation.DELETE,
            resource: Resource.SESSION,
            others: (decodedToken, paramId) => decodedToken._id !== paramId
        }),
        // Check parameters of request
        function (req, res, next) {
            const { id } = req.params
            if (!Types.ObjectId.isValid(id)) return next({ status: 400, description: "Required a valid 'id'" })
            next()
        }
    ]
}

export function updateAccessToken(): Middlewares {
    return [
        extractAuthorization(),
        // Check parameters, queries, body of request
        function (req, res, next) {
            if (!Types.ObjectId.isValid(req.params.id)) return next({ status: 400, description: "Required a valid 'id'" })
            if (!req.locals.access_token) return next({ status: 400, description: "Missing access token" })
            if (!req.body.refresh_token) return next({ status: 400, description: "Missing refresh token" })
            next()
        }
    ]
}
