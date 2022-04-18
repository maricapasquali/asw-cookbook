import {Middlewares, restrictedUser, extractAuthorization} from "../../base";
import {RBAC} from "../../../modules/rbac";
import Operation = RBAC.Operation;
import Resource = RBAC.Resource;

export function login(): Middlewares {
    return extractAuthorization()
}

export function logout(): Middlewares {
    return restrictedUser({
        operation: Operation.DELETE,
        subject: Resource.SESSION,
        others: (decodedToken, param_id) => decodedToken._id !== param_id
    })
}

export function update_access_token(): Middlewares {
    return extractAuthorization()
}
