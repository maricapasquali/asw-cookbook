import { DecodedTokenType } from "../libs/jwt.token"
import { Types } from "mongoose"
import { RBAC } from "../libs/rbac"
import Operation = RBAC.Operation
import Resource = RBAC.Resource

function _extractAuthorization(req) {
    req.locals = req.locals || {}
    if (req.headers.authorization) {
        const [type, value] = req.headers.authorization.split(" ")
        switch (type) {
            case "Basic": {
                const [userID, password] = Buffer.from(value, "base64")
                    .toString("utf-8")
                    .split(":")
                req.locals.userID = userID
                req.locals.password = password
            }
                break
            case "Bearer": {
                req.locals.access_token = value
            }
                break
            default:
                throw new Error(`Headers Authorization '${type}' not implemented.`)
        }
    }
}

function checkAndDecode(options?: AuthOption): Middleware {
    return function (req, res, next) {
        const decodedToken: DecodedTokenType | boolean = tokensManager.checkValidityOfToken(req.locals.access_token)
        if (decodedToken) {
            if (options) {
                options.others = options.others || (() => false)
                options.ignoreValidationParamId = options.ignoreValidationParamId || false

                const isIDValid = options.ignoreValidationParamId || Types.ObjectId.isValid(req.params.id)
                if (!isIDValid) return next({ status: 400, description: "Required a valid 'id'" })

                if (!accessManager.isAuthorized(decodedToken.role, options.operation, options.resource, options.others(decodedToken, req.params.id)))
                    return next({ status: 403, description: `User is unauthorized to ${options.operation.toUpperCase()} resource ${options.resource.toUpperCase()}.` })

            }
            req.locals.user = decodedToken
            next()
        } else {
            next({ status: 401, description: "User is not authenticated" })
        }
    }
}

type AuthOption = { operation: Operation, resource: Resource, others?: (decodedToken: DecodedTokenType, paramId: string) => boolean, ignoreValidationParamId?: boolean }

export type CallbackNext = (err?: any) => any

export type Middleware = (req: any, res: any, next: CallbackNext) => void

export type Middlewares = Middleware | Middleware[]

/**
 * @return middleware to extract credential from header _authorization_
 */
export function extractAuthorization(): Middleware {
    return function (req, res, next) {
        try {
            _extractAuthorization(req)
            next()
        } catch (e) {
            next(e)
        }
    }
}

/**
 * @param options options of middleware ({@link AuthOption})
 * @return middleware to check authorization on a resource and an operation and if authorization isn't present, a bad request error is sent.
 */
export function checkRestrictedRBAC(options?: AuthOption): Middleware {
    return function (req, res, next) {
        extractAuthorization()(req, res, (err?: any): any => {
            if (err) return next(err)
            if (req.locals.access_token) checkAndDecode(options)(req, res, next)
            else next({ status: 400, description: "Missing authorization." })
        })
    }
}

/**
 * @param options options of middleware ({@link AuthOption})
 * @return middleware to check authorization on a resource and an operation.
 */
export function checkNormalRBAC(options?: AuthOption): Middleware {
    return function (req, res, next) {
        extractAuthorization()(req, res, (err?: any): any => {
            if (err) return next(err)
            if (req.locals.access_token) checkAndDecode(options)(req, res, next)
            else next()
        })
    }
}

/**
 * @param headersToCheck object that represents headers to check with the correct values
 * @return middleware to check headers on a request.
 */
export function checkRequestHeaders(headersToCheck: object): Middleware {
    return function (req, res, next) {
        const headersNotValid: object = Object.entries(headersToCheck)
            .filter(([key, value]) => {
                const header = req.get(key)
                return !header || header.search(value) == -1
            })
            .reduce((prev, current) => {
                prev[current[0]] = current[1]
                return prev
            }, {})
        if (Object.keys(headersNotValid).length > 0) {
            console.debug(headersNotValid)
            next({ status: 400, description: "Headers are not correct. Correct headers : " + JSON.stringify(headersNotValid) })
        } else next()
    }
}

/**
 * @param uploader uploader middleware to wrap ({@link FileUploader})
 * @return middleware that wrap an uploader middleware and if error occurred, a bad request error is sent.
 */
export function wrapUpload(uploader: any): Middleware {
    return function (req, res, next) {
        uploader(req, res, err => {
            if (err) return next({ status: 400, description: err.message, code: err.code })
            next()
        })
    }
}
