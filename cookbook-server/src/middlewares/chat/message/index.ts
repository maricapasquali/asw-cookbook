import {Middlewares, checkRestrictedRBAC} from "../../base";
import {RBAC} from "../../../../modules/rbac";
import Operation = RBAC.Operation;
import Resource = RBAC.Resource;

export function send(): Middlewares {
    return checkRestrictedRBAC({
        operation: Operation.CREATE,
        resource: Resource.MESSAGE,
        others: (decodedToken, param_id) => decodedToken._id !== param_id
    })
}

export function read_messages(): Middlewares {
    return checkRestrictedRBAC({
        operation: Operation.UPDATE,
        resource: Resource.MESSAGE,
        others: (decodedToken, param_id) => decodedToken._id != param_id
    })
}

export function list(): Middlewares {
    return checkRestrictedRBAC({
        operation: Operation.RETRIEVE,
        resource: Resource.MESSAGE,
        others:  (decodedToken, param_id) => decodedToken._id !== param_id
    })
}
