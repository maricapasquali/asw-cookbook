import {Middlewares, checkRestrictedRBAC, checkNormalRBAC} from "../../base";
import {RBAC} from "../../../../modules/rbac";
import Resource = RBAC.Resource;
import Operation = RBAC.Operation;


export function create(): Middlewares {
    return checkRestrictedRBAC({
        resource: Resource.FRIEND,
        operation: Operation.CREATE,
        others: (decodedToken, param_id) => decodedToken._id === param_id
    })
}

export function list(): Middlewares {
    return checkNormalRBAC({
        operation: Operation.RETRIEVE,
        resource: Resource.FRIEND,
        others: (decodedToken, param_id) => (decodedToken.role as RBAC.Role === RBAC.Role.ADMIN) && decodedToken._id != param_id
    })
}

export function update(): Middlewares {
    return checkRestrictedRBAC({
        operation: Operation.UPDATE,
        resource: Resource.FRIEND,
        others: (decodedToken, param_id) => decodedToken._id !== param_id
    })
}

export function erase(): Middlewares {
    return checkRestrictedRBAC({
        operation: Operation.DELETE,
        resource: Resource.FRIEND,
        others: (decodedToken, param_id) => decodedToken._id !== param_id
    })
}
