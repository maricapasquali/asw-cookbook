import {
    checkRequestHeaders,
    Middlewares,
    normalUser,
    restrictedUser,
    Middleware
} from "../base";
import {RBAC} from "../../modules/rbac";
import Operation = RBAC.Operation;
import {randomString} from "../../modules/utilities";
import * as path from "path";
import {FileUploader} from "../../modules/uploader";
import FileType = FileUploader.FileType;

export enum UpdateAction {
    PERMISSION = 'permission'
}
export namespace UpdateAction {
    export function isPermissionType(type: string): boolean {
        return type as UpdateAction === UpdateAction.PERMISSION
    }
}

export function uploadImageAndTutorial(): Middleware {
    let _configurationImage = {
        ...FileConfigurationImage, ...{
            newFileName: function (file: any){
                return 'recipe-' + randomString(30) + path.extname(file.originalname)
            }
        }
    }

    let _configurationVideo = {...FileConfigurationVideo, ...{
            newFileName: function (file: any){
                return 'tutorial-' + randomString(30) + path.extname(file.originalname)
            }
        }}

    return fileUploader.mixed(
        [
            { name: 'img', maxCount: 1, type: FileType.IMAGE },
            { name: 'tutorial', maxCount: 1, type: FileType.VIDEO }
        ],
        [_configurationImage, _configurationVideo])
}

export function create(): Middlewares {
    return [
        checkRequestHeaders({'content-type': 'multipart/form-data'}),
        restrictedUser({
            operation: Operation.CREATE,
            subject: RBAC.Resource.RECIPE,
            others: (decodedToken, param_id) => decodedToken._id != param_id
        })
    ]
}

export function all(): Middlewares {
    return normalUser()
}

export function one_shared(): Middlewares {
    return normalUser()
}

export function numberRecipesForCountry(): Middlewares {
    return normalUser()
}

export function erase(): Middlewares {
    return restrictedUser({
        operation: Operation.DELETE,
        subject: RBAC.Resource.RECIPE
    })
}

export function update(): Middlewares {
    return [
        function (req, res, next){
            const { field } = req.query
            checkRequestHeaders({'content-type': UpdateAction.isPermissionType(field) ? 'application/json' : 'multipart/form-data' })(req, res, next)
        },
        restrictedUser({
            operation: Operation.UPDATE,
            subject: RBAC.Resource.RECIPE
        })
    ]
}

export function list(): Middlewares {
    return function (req, res, next) {
        let {type} = req.query
        if(type === 'shared') normalUser()(req, res, next)
        else
            restrictedUser({
                operation: Operation.RETRIEVE,
                subject: RBAC.Resource.RECIPE,
                others: (decodedToken, param_id) => decodedToken._id != param_id
            })(req, res, next)
    }
}

export function one(): Middlewares {
    return function (req, res, next) {
        let {type} = req.query
        if(type === 'shared') {
            let filters = { owner: req.params.id }
            if(!req.locals) req.locals = { filters }
            else req.locals.filters = filters
            normalUser()(req, res, next)
        }
        else {
            restrictedUser({
                operation: Operation.RETRIEVE,
                subject: RBAC.Resource.RECIPE,
                others: (decodedToken, param_id) => decodedToken._id != param_id
            })(req, res, next)
        }
    }
}
