import {Middlewares, checkRestrictedRBAC, checkNormalRBAC, Middleware, wrapUpload} from "../base";
import {RBAC} from "../../modules/rbac";
import Operation = RBAC.Operation;
import Resource = RBAC.Resource;
import {randomString} from "../../modules/utilities";
import * as path from "path";

export function uploadProfileImage(): Middleware {
    let config = {...FileConfigurationImage, ...{
            newFileName: function (file: any){
                return 'user-' + randomString(30) + path.extname(file.originalname)
            }
        }}
    return wrapUpload(fileUploader.single('img', config))
}

export function all_user(): Middlewares {
    return checkNormalRBAC()
}

export function one(): Middlewares {
    return checkNormalRBAC()
}

export function update_user(): Middlewares {
    return checkRestrictedRBAC({
        operation: Operation.UPDATE,
        resource: Resource.USER,
        others: (decodedToken, param_id) => decodedToken._id !== param_id
    })
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