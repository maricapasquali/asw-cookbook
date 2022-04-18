import {Middlewares, restrictedUser, normalUser, Middleware} from "../base";
import {RBAC} from "../../modules/rbac";
import Operation = RBAC.Operation;
import Resource = RBAC.Resource;
import {randomString} from "../../modules/utilities";
import * as path from "path";

export function uploadProfileImage(): Middleware {
    let config = {...FileConfigurationImage, ...{
            newFileName: function (file: any){
                return randomString(30) + path.extname(file.originalname)
            }
        }}
    return fileUploader.single('img', config)
}

export function all_user(): Middlewares {
    return normalUser()
}

export function one(): Middlewares {
    return normalUser()
}

export function update_user(): Middlewares {
    return restrictedUser({
        operation: Operation.UPDATE,
        subject: Resource.USER,
        others: (decodedToken, param_id) => decodedToken._id !== param_id
    })
}

export function update_credential():Middlewares {
    return restrictedUser({
        operation: Operation.UPDATE,
        subject: Resource.USER_CREDENTIAL,
        others: (decodedToken, param_id) => decodedToken._id !== param_id
    })
}

export function erase(): Middlewares {
    return restrictedUser({
        operation: Operation.DELETE,
        subject: Resource.USER,
        others: (decodedToken, param_id) => decodedToken._id !== param_id
    })
}