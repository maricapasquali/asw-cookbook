import { Types } from "mongoose"
import {
    checkRestrictedRBAC,
    Middleware,
    Middlewares
} from "../../base"
import * as _ from "lodash"
import { RBAC } from "../../../libs/rbac"
import ObjectId = Types.ObjectId
import Resource = RBAC.Resource
import Operation = RBAC.Operation

// Check parameters, queries, body of request
function checkParamsQueriesBody(operation: RBAC.Operation): Middleware {
    return function (req, res, next) {
        const { id, chatID } = req.params
        if (!ObjectId.isValid(id)) return next({ status: 400, description: "Required a valid 'id'" })
        if (!ObjectId.isValid(chatID)) return next({ status: 400, description: "Required a valid 'chatID'" })

        switch (operation) {
            case RBAC.Operation.CREATE: {
                const { content, attachment } = req.body
                if (!(content || (!content && attachment))) {
                    return next({
                        status: 400,
                        description: "Body must be of the form: " +
                                     "{ content: string, attachment?: string, timestamp?: number  } or " +
                                     "{ content?: string, attachment: string, timestamp?: number  } "
                    })
                }
            }
                break
            case RBAC.Operation.UPDATE: {
                const messages = _.uniq(req.body.messages)
                if (!messages.length) return next({ status: 400, description: "Body must be of the form: { messages: [string,...] } " })
                req.locals.messages = messages
            }
                break
            case RBAC.Operation.RETRIEVE: break
            default: return next({ status: 400, description: "Operation " + operation + " not valid." })
        }
        next()
    }
}

export function send(): Middlewares {
    return [
        checkRestrictedRBAC({
            operation: Operation.CREATE,
            resource: Resource.MESSAGE,
            others: (decodedToken, paramId) => decodedToken._id !== paramId
        }),
        checkParamsQueriesBody(Operation.CREATE)
    ]
}

export function readMessages(): Middlewares {
    return [
        checkRestrictedRBAC({
            operation: Operation.UPDATE,
            resource: Resource.MESSAGE,
            others: (decodedToken, paramId) => decodedToken._id != paramId
        }),
        checkParamsQueriesBody(Operation.UPDATE)
    ]
}

export function list(): Middlewares {
    return [
        checkRestrictedRBAC({
            operation: Operation.RETRIEVE,
            resource: Resource.MESSAGE,
            others: (decodedToken, paramId) => decodedToken._id !== paramId
        }),
        checkParamsQueriesBody(Operation.RETRIEVE)
    ]
}
