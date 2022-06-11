import {Types} from "mongoose";
import {checkRestrictedRBAC, Middleware, Middlewares} from "../base";
import {RBAC} from "../../libs/rbac";
import Resource = RBAC.Resource;
import Operation = RBAC.Operation;


// Check parameters, queries, body of request
function checkParamsQueriesBody(operation: RBAC.Operation): Middleware {
    return function (req, res, next){
        let {id} = req.params
        if(!Types.ObjectId.isValid(id)) return next({status: 400, description: 'Required a valid \'id\''})

        switch (operation){
            case RBAC.Operation.RETRIEVE: {
                let readed = req.query.readed
                if(readed){
                    try {
                        readed = JSON.parse(readed)
                        if(typeof readed !== 'boolean') throw new Error()
                    } catch (e){
                        return next({status: 400, description: 'Query \'readed\' must be a boolean' })
                    }
                }
                req.locals.filters = typeof readed === 'boolean' ? { read: readed }: {}
                next()
            }
                break
            case RBAC.Operation.UPDATE: {
                let { notificationID } = req.params
                if(!Types.ObjectId.isValid(notificationID)) return next({status: 400, description:  'Required a valid \'notificationID\''})
                let { read } = req.body
                if(typeof read !== 'boolean') return next({status: 400, description: 'Body required field \'read: boolean\' '})
                next()
            }
                break
            case RBAC.Operation.DELETE: {
                let { notificationID } = req.params
                if(!Types.ObjectId.isValid(notificationID)) return next({status: 400, description: 'Required a valid \'notificationID\''})
                next()
            }
            break
            default: return next({status: 400, description: 'Operation ' + operation + ' not valid.'})
        }
    }
}

export function list(): Middlewares {
    return [
        checkRestrictedRBAC({
            operation: Operation.RETRIEVE,
            resource: Resource.NOTIFICATION,
            others: (decodedToken, param_id) => decodedToken._id !== param_id
        }),
        checkParamsQueriesBody(Operation.RETRIEVE)
    ]
}

export function update(): Middlewares {
    return [
        checkRestrictedRBAC({
            operation: Operation.UPDATE,
            resource: Resource.NOTIFICATION,
            others: (decodedToken, param_id) => decodedToken._id !== param_id
        }),
        checkParamsQueriesBody(Operation.UPDATE)
    ]
}

export function erase(): Middlewares {
    return [
        checkRestrictedRBAC({
            operation: Operation.DELETE,
            resource: Resource.NOTIFICATION,
            others:  (decodedToken, param_id) => decodedToken._id !== param_id
        }),
        checkParamsQueriesBody(Operation.DELETE)
    ]
}
