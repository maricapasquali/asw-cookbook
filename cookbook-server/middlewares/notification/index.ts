import {Middlewares, restrictedUser} from "../base";
import {RBAC} from "../../modules/rbac";
import Operation = RBAC.Operation;
import Resource = RBAC.Resource;

export function list(): Middlewares {
    return restrictedUser({
        operation: Operation.RETRIEVE,
        subject: Resource.NOTIFICATION,
        others: (decodedToken, param_id) => decodedToken._id !== param_id
    })
}

export function update(): Middlewares {
    return restrictedUser({
        operation: Operation.UPDATE,
        subject: Resource.NOTIFICATION,
        others: (decodedToken, param_id) => decodedToken._id !== param_id
    })
}

export function erase(): Middlewares {
    return restrictedUser({
        operation: Operation.DELETE,
        subject: Resource.NOTIFICATION,
        others:  (decodedToken, param_id) => decodedToken._id !== param_id
    })
}
