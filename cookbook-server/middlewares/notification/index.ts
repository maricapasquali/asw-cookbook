import {Middlewares, checkRestrictedRBAC} from "../base";
import {RBAC} from "../../modules/rbac";
import Operation = RBAC.Operation;
import Resource = RBAC.Resource;

export function list(): Middlewares {
    return checkRestrictedRBAC({
        operation: Operation.RETRIEVE,
        resource: Resource.NOTIFICATION,
        others: (decodedToken, param_id) => decodedToken._id !== param_id
    })
}

export function update(): Middlewares {
    return checkRestrictedRBAC({
        operation: Operation.UPDATE,
        resource: Resource.NOTIFICATION,
        others: (decodedToken, param_id) => decodedToken._id !== param_id
    })
}

export function erase(): Middlewares {
    return checkRestrictedRBAC({
        operation: Operation.DELETE,
        resource: Resource.NOTIFICATION,
        others:  (decodedToken, param_id) => decodedToken._id !== param_id
    })
}
