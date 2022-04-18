import {Middlewares, restrictedUser, normalUser} from "../../base";
import {RBAC} from "../../../modules/rbac";
import Resource = RBAC.Resource;
import Operation = RBAC.Operation;


export function create(): Middlewares {
    return restrictedUser({
        subject: Resource.FRIEND,
        operation: Operation.CREATE,
        others: (decodedToken, param_id) => decodedToken._id === param_id
    })
}

export function list(): Middlewares {
    return normalUser({
        operation: Operation.RETRIEVE,
        subject: Resource.FRIEND,
        others: (decodedToken, param_id) => (decodedToken.role as RBAC.Role === RBAC.Role.ADMIN) && decodedToken._id != param_id
    })
}

export function update(): Middlewares {
    return restrictedUser({
        operation: Operation.UPDATE,
        subject: Resource.FRIEND,
        others: (decodedToken, param_id) => decodedToken._id !== param_id
    })
}

export function erase(): Middlewares {
    return restrictedUser({
        operation: Operation.DELETE,
        subject: Resource.FRIEND,
        others: (decodedToken, param_id) => decodedToken._id !== param_id
    })
}