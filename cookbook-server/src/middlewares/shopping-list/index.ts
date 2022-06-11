import {checkRestrictedRBAC, Middleware, Middlewares} from "../base";
import {RBAC} from "../../libs/rbac";
import {Types} from "mongoose";
import {Food, User} from "../../models";
import {SignUp} from "../../models/schemas/user";
import Resource = RBAC.Resource;
import Operation = RBAC.Operation;
import {existById} from "../../database/utils";

// Check parameters, queries, body of request
function checkParamsQueriesBody(operation: RBAC.Operation): Middleware {
    return function (req, res, next){
        let id = req.params.id
        if(!Types.ObjectId.isValid(id)) return next({ status: 400, description: 'Required a valid \'id\''})

        if(operation === Operation.UPDATE || operation === Operation.DELETE){
            let {pointShoppingListID} = req.params
            if(!Types.ObjectId.isValid(pointShoppingListID)) return next({ status: 400, description: 'Required a valid \'pointShoppingListID\''})

            if(Operation.UPDATE === operation && req.body?.checked === undefined) return next({ status: 400, description: 'Body required field \'checked: boolean\' '})
            next()
        }
        else {
           const existsUserChecked = (): Promise<void> => {
                return User.exists({ _id: { $eq: req.locals.user._id }, signup: SignUp.State.CHECKED, 'credential.role': RBAC.Role.SIGNED })
                            .then(exist => {
                                console.debug('User exist = ', exist)
                                if (!exist) return Promise.reject({ status: 404, description: 'User is not found.' })
                                return Promise.resolve()
                            }, err =>  Promise.reject({ status: 500, code: err.code || 0, description: err.message}));
            }

           switch (operation){
               case RBAC.Operation.CREATE:
                   return existsUserChecked()
                            .then(() => {
                               let body = req.body
                               if(!Types.ObjectId.isValid(body.food)) return next({ status: 400, description:  'Required a valid \'food\' '})
                               return existById(Food, [body.food]).then(() => next(), () => next({ status: 404, description: 'Food is not found.' }))
                            })
                            .catch(err => next(err))
               case RBAC.Operation.RETRIEVE:
                   return existsUserChecked().then(() => next()).catch(err => next(err))
               default:
                   return next({status: 400, description: 'Operation ' + operation + ' not valid.'})
           }
        }
    }
}


export function list(): Middlewares {
    return [
        checkRestrictedRBAC({
            operation: Operation.RETRIEVE,
            resource: Resource.SHOPPING_LIST,
            others: (decodedToken, param_id) => decodedToken._id !== param_id
        }),
        checkParamsQueriesBody(Operation.RETRIEVE)
    ]
}

export function add(): Middlewares {
    return [
        checkRestrictedRBAC({
            operation: Operation.CREATE,
            resource: Resource.SHOPPING_LIST,
            others: (decodedToken, param_id) => decodedToken._id !== param_id
        }),
        checkRestrictedRBAC({
            operation: Operation.CREATE,
            resource: Resource.SHOPPING_LIST_POINT,
            others: (decodedToken, param_id) => decodedToken._id !== param_id
        }),
        checkParamsQueriesBody(Operation.CREATE)
    ]
}

export function update(): Middlewares {
    return [
        checkRestrictedRBAC({
            operation: Operation.UPDATE,
            resource:  Resource.SHOPPING_LIST_POINT,
            others: (decodedToken, param_id) => decodedToken._id !== param_id
        }),
        checkParamsQueriesBody(Operation.UPDATE)
    ]
}

export function erase(): Middlewares {
    return [
        checkRestrictedRBAC({
            operation: Operation.DELETE,
            resource: Resource.SHOPPING_LIST_POINT,
            others: (decodedToken, param_id) => decodedToken._id !== param_id
        }),
        checkParamsQueriesBody(Operation.DELETE)
    ]
}
