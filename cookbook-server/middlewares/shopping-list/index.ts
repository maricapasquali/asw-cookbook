import {Middlewares, restrictedUser} from "../base";
import {RBAC} from "../../modules/rbac";
import Resource = RBAC.Resource;
import Operation = RBAC.Operation;

export function list(): Middlewares {
    return restrictedUser({
        operation: Operation.RETRIEVE,
        subject: Resource.SHOPPING_LIST,
        others: (decodedToken, param_id) => decodedToken._id !== param_id
    })
}

export function add(): Middlewares {
    return [
        restrictedUser({
            operation: Operation.CREATE,
            subject: Resource.SHOPPING_LIST,
            others: (decodedToken, param_id) => decodedToken._id !== param_id
        }),
        restrictedUser({
            operation: Operation.CREATE,
            subject: Resource.SHOPPING_LIST_POINT,
            others: (decodedToken, param_id) => decodedToken._id !== param_id
        })
    ]
}

export function update(): Middlewares {
    return restrictedUser({
        operation: Operation.UPDATE,
        subject:  Resource.SHOPPING_LIST_POINT,
        others: (decodedToken, param_id) => decodedToken._id !== param_id
    })
}

export function erase(): Middlewares {
    return restrictedUser({
        operation: Operation.DELETE,
        subject: Resource.SHOPPING_LIST_POINT,
        others: (decodedToken, param_id) => decodedToken._id !== param_id
    })
}