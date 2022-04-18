import {DecodedTokenType} from "../modules/jwt.token";
import {Types} from "mongoose";
import {RBAC} from "../modules/rbac";
import Operation = RBAC.Operation;
import Resource = RBAC.Resource;

function _extractAuthorization(req) {
    req.locals = req.locals || {}
    if(req.headers.authorization) {
        const [type, value] = req.headers.authorization.split(' ')
        switch (type){
            case 'Basic': {
                let buff = Buffer.from(value, 'base64');
                let [userID, password] = buff.toString('utf-8').split(':');
                req.locals.userID = userID
                req.locals.password = password
            }
                break;
            case 'Bearer': {
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
        let decoded_token: DecodedTokenType | boolean = tokensManager.checkValidityOfToken(req.locals.access_token);
        if(decoded_token) {
            if(options) {
                options.others = options.others || (() => false)
                options.ignoreValidationParamId = options.ignoreValidationParamId || false

                let isIDValid = options.ignoreValidationParamId || Types.ObjectId.isValid(req.params.id)
                if(!isIDValid) return next({status: 400, description: 'Required a valid \'id\''})

                if(isIDValid && accessManager.isAuthorized(decoded_token.role, options.operation, options.subject, options.others(decoded_token, req.params.id))){
                    req.locals.user = decoded_token
                    next()
                }
                else {
                    next({status: 403, description: 'User is unauthorized to execute this function.'})
                }
            }
            else {
                req.locals.user = decoded_token
                next()
            }
        }
        else {
            next({status: 401, description: 'User is not authenticated'})
        }
    }
}

type AuthOption = { operation: Operation, subject: Resource, others?: (decodedToken: DecodedTokenType, param_id: string) => boolean, ignoreValidationParamId?: boolean }

export type Middleware = ( req, res, next: (err?: any) => any ) => void

export type Middlewares = Middleware | Middleware[]

export function extractAuthorization(): Middleware {
    return function (req, res, next){
        try {
            _extractAuthorization(req)
            next()
        }catch (e) {
            next(e)
        }
    }
}

export function restrictedUser(options?: AuthOption): Middleware {
    return function (req, res, next){
        extractAuthorization()(req, res, (err?: any): any => {
            if(err) return next(err)
            if(req.locals.access_token) checkAndDecode(options)(req, res, next)
            else next({status: 400, description: 'Missing authorization.'})
        })
    }
}

export function normalUser(options?: AuthOption): Middleware {
    return function (req, res, next){
        extractAuthorization()(req, res, (err?: any): any => {
            if(err) return next(err)
            if(req.locals.access_token) checkAndDecode(options)(req, res, next)
            else next()
        })
    }
}

export function checkRequestHeaders(headersToCheck: object): Middleware {
    return function (req, res, next) {
        let headersNotValid: object = Object.entries(headersToCheck)
            .filter(([key, value]) => {
                let header = req.get(key)
                return !header || header.search(value) == -1
            })
            .reduce((prev, current) => {
                prev[current[0]] = current[1];
                return prev;
            }, {});
        if(Object.keys(headersNotValid).length > 0)  {
            console.debug(headersNotValid)
            next({status: 400, description: 'Headers are not correct. Correct headers : ' + JSON.stringify(headersNotValid) })
        }
        else next()
    }
}

