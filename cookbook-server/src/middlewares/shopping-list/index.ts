import {Middlewares, checkRestrictedRBAC} from "../base";
import {RBAC} from "../../../modules/rbac";
import Resource = RBAC.Resource;
import Operation = RBAC.Operation;

export function list(): Middlewares {
    return checkRestrictedRBAC({
        operation: Operation.RETRIEVE,
        resource: Resource.SHOPPING_LIST,
        others: (decodedToken, param_id) => decodedToken._id !== param_id
    })
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
        })
    ]
}

export function update(): Middlewares {
    return checkRestrictedRBAC({
        operation: Operation.UPDATE,
        resource:  Resource.SHOPPING_LIST_POINT,
        others: (decodedToken, param_id) => decodedToken._id !== param_id
    })
}

export function erase(): Middlewares {
    return checkRestrictedRBAC({
        operation: Operation.DELETE,
        resource: Resource.SHOPPING_LIST_POINT,
        others: (decodedToken, param_id) => decodedToken._id !== param_id
    })
}
