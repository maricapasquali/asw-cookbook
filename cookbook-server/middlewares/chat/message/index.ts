import {Middlewares, restrictedUser} from "../../base";
import {RBAC} from "../../../modules/rbac";
import Operation = RBAC.Operation;
import Resource = RBAC.Resource;

export function send(): Middlewares {
    return restrictedUser({
        operation: Operation.CREATE,
        subject: Resource.MESSAGE,
        others: (decodedToken, param_id) => decodedToken._id !== param_id
    })
}

export function read_messages(): Middlewares {
    return restrictedUser({
        operation: Operation.UPDATE,
        subject: Resource.MESSAGE,
        others: (decodedToken, param_id) => decodedToken._id != param_id
    })
}

export function list(): Middlewares {
    return restrictedUser({
        operation: Operation.RETRIEVE,
        subject: Resource.MESSAGE,
        others:  (decodedToken, param_id) => decodedToken._id !== param_id
    })
}