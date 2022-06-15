import {
    CallbackNext,
    checkRestrictedRBAC,
    Middleware,
    Middlewares
} from "../base"
import { RBAC } from "../../libs/rbac"
import { Types } from "mongoose"
import {
    Food,
    User
} from "../../models"
import { SignUp } from "../../models/schemas/user"
import { existById } from "../../database/utils"
import Resource = RBAC.Resource
import Operation = RBAC.Operation

// Check parameters, queries, body of request
function checkParamsQueriesBody(operation: RBAC.Operation): Middleware {
    return function (req, res, next) {
        const id = req.params.id
        if (!Types.ObjectId.isValid(id)) return next({ status: 400, description: "Required a valid 'id'" })

        function existsUserChecked(req: any, res: any, next: CallbackNext): void {
            User.exists({ _id: { $eq: req.locals.user._id }, signup: SignUp.State.CHECKED, "credential.role": RBAC.Role.SIGNED })
                .then(exist => {
                    console.debug("User exist = ", exist)
                    if (!exist) return next({ status: 404, description: "User is not found." })
                    return next()
                }, err => next({ status: 500, code: err.code || 0, description: err.message }))
        }

        if (operation === Operation.UPDATE || operation === Operation.DELETE) {
            const { pointShoppingListID } = req.params
            if (!Types.ObjectId.isValid(pointShoppingListID)) return next({ status: 400, description: "Required a valid 'pointShoppingListID'" })

            if (Operation.UPDATE === operation && req.body?.checked === undefined) return next({ status: 400, description: "Body required field 'checked: boolean' " })
            next()
        } else {
            switch (operation) {
                case RBAC.Operation.CREATE:
                    existsUserChecked(req, res, err => {
                        if (err) return next(err)
                        const body = req.body
                        if (!Types.ObjectId.isValid(body.food)) return next({ status: 400, description: "Required a valid 'food' " })
                        return existById(Food, [body.food]).then(() => next(), () => next({ status: 404, description: "Food is not found." }))
                    })
                    break
                case RBAC.Operation.RETRIEVE:
                    existsUserChecked(req, res, next)
                    break
                default:
                    return next({ status: 400, description: "Operation " + operation + " not valid." })
            }
        }
    }
}

export function list(): Middlewares {
    return [
        checkRestrictedRBAC({
            operation: Operation.RETRIEVE,
            resource: Resource.SHOPPING_LIST,
            others: (decodedToken, paramId) => decodedToken._id !== paramId
        }),
        checkParamsQueriesBody(Operation.RETRIEVE)
    ]
}

export function add(): Middlewares {
    return [
        checkRestrictedRBAC({
            operation: Operation.CREATE,
            resource: Resource.SHOPPING_LIST,
            others: (decodedToken, paramId) => decodedToken._id !== paramId
        }),
        checkRestrictedRBAC({
            operation: Operation.CREATE,
            resource: Resource.SHOPPING_LIST_POINT,
            others: (decodedToken, paramId) => decodedToken._id !== paramId
        }),
        checkParamsQueriesBody(Operation.CREATE)
    ]
}

export function update(): Middlewares {
    return [
        checkRestrictedRBAC({
            operation: Operation.UPDATE,
            resource: Resource.SHOPPING_LIST_POINT,
            others: (decodedToken, paramId) => decodedToken._id !== paramId
        }),
        checkParamsQueriesBody(Operation.UPDATE)
    ]
}

export function erase(): Middlewares {
    return [
        checkRestrictedRBAC({
            operation: Operation.DELETE,
            resource: Resource.SHOPPING_LIST_POINT,
            others: (decodedToken, paramId) => decodedToken._id !== paramId
        }),
        checkParamsQueriesBody(Operation.DELETE)
    ]
}
