import {Middlewares, checkRestrictedRBAC, extractAuthorization} from "../../base";
import {RBAC} from "../../../libs/rbac";
import Operation = RBAC.Operation;
import Resource = RBAC.Resource;

export function login(): Middlewares {
    return extractAuthorization()
}

export function logout(): Middlewares {
    return checkRestrictedRBAC({
        operation: Operation.DELETE,
        resource: Resource.SESSION,
        others: (decodedToken, param_id) => decodedToken._id !== param_id
    })
}

export function update_access_token(): Middlewares {
    return extractAuthorization()
}
