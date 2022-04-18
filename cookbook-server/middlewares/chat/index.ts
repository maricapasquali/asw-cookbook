import {checkRequestHeaders, Middleware, Middlewares, restrictedUser} from "../base";
import {RBAC} from "../../modules/rbac";
import Operation = RBAC.Operation;
import Resource = RBAC.Resource;
import {randomString} from "../../modules/utilities";
import * as path from "path";

export enum UpdateAction{
    UPDATE_USER_ROLE = 'update-user-role',
    UPDATE_CHAT_NAME = 'update-chat-name',
    ADD_USERS = 'add-users',
    UPDATE_CHAT_IMAGE = 'update-chat-image',
}

export namespace UpdateAction {
    export function isUpdateImageAction(action: string): boolean {
        return (action as UpdateAction) === UpdateAction.UPDATE_CHAT_IMAGE
    }
}


export function uploadChatImage(): Middleware {
    let config = {...FileConfigurationImage, ...{
            newFileName: function (file: any){
                return 'chat-image-' + randomString(30) + path.extname(file.originalname)
            }
        }}
    return fileUploader.single('image', config)
}

export function create(): Middlewares {
    return [
        checkRequestHeaders({'content-type': 'multipart/form-data'}),
        restrictedUser({
            operation: Operation.CREATE,
            subject: Resource.CHAT,
            others: (decodedToken, param_id) => decodedToken._id !== param_id
        })
    ]
}

export function list(): Middlewares {
    return restrictedUser({
        operation: Operation.RETRIEVE,
        subject: Resource.CHAT,
        others:  (decodedToken, param_id) => decodedToken._id !== param_id
    })
}

export function one(): Middlewares {
    return restrictedUser({
        operation: Operation.RETRIEVE,
        subject: Resource.CHAT,
        others: (decodedToken, param_id) => decodedToken._id !== param_id
    })
}

export function erase(): Middlewares {
    return restrictedUser({
        operation: Operation.DELETE,
        subject: Resource.CHAT,
        others: (decodedToken, param_id) => decodedToken._id !== param_id
    })
}

export function update(): Middlewares {
    return [
        function (req, res, next){
            let {action} = req.query
            checkRequestHeaders({'content-type': UpdateAction.isUpdateImageAction(action) ? 'multipart/form-data': 'application/json'})(req, res, next)
        },
        restrictedUser({
            operation: Operation.UPDATE,
            subject: Resource.CHAT,
            others: (decodedToken, param_id) => decodedToken._id !== param_id
        })
    ]
}

