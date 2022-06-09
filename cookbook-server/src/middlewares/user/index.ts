import {Middlewares, checkRestrictedRBAC, checkNormalRBAC} from "../base";
import {RBAC} from "../../libs/rbac";
import Operation = RBAC.Operation;
import Resource = RBAC.Resource;
import {uploadProfileImage} from "./base";

export function create(): Middlewares {
    return uploadProfileImage()
}

export function all_user(): Middlewares {
    return checkNormalRBAC()
}

export function one(): Middlewares {
    return checkNormalRBAC()
}

export function update_user(): Middlewares {
    return [
        checkRestrictedRBAC({
            operation: Operation.UPDATE,
            resource: Resource.USER,
            others: (decodedToken, param_id) => decodedToken._id !== param_id
        }),
        uploadProfileImage()
    ]
}

export function update_credential():Middlewares {
    return checkRestrictedRBAC({
        operation: Operation.UPDATE,
        resource: Resource.USER_CREDENTIAL,
        others: (decodedToken, param_id) => decodedToken._id !== param_id
    })
}

export function erase(): Middlewares {
    return checkRestrictedRBAC({
        operation: Operation.DELETE,
        resource: Resource.USER,
        others: (decodedToken, param_id) => decodedToken._id !== param_id
    })
}
