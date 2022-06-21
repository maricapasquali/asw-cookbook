import {
    checkNormalRBAC,
    checkRequestHeaders,
    checkRestrictedRBAC,
    Middleware,
    Middlewares,
    wrapUpload
} from "../base"
import { RBAC } from "../../libs/rbac"
import {
    decodeToArray,
    randomString,
    valuesOfEnum
} from "../../libs/utilities"
import * as path from "path"
import {
    FileUploader,
    UploaderConfiguration
} from "../../libs/uploader"
import { FilesystemResource } from "../../filesystem"
import { Types } from "mongoose"
import { existById } from "../../database/utils"
import {
    Food,
    User
} from "../../models"
import { IPermission } from "../../models/schemas/recipe/permission"
import Operation = RBAC.Operation
import FileType = FileUploader.FileType

function getFilters(query: any, user?: string): object {

    const { name, countries, diets, categories, ingredients } = query

    const filters = user ? {} : { shared: true }

    if (name) filters["name"] = { $regex: `^${name}`, $options: "i" }
    if (countries) filters["country"] = { $in: countries }
    if (diets) filters["diet"] = { $in: diets }
    if (categories) filters["category"] =  { $in: categories }
    if (ingredients) filters["ingredients.food"] = { $all: ingredients.filter(i => Types.ObjectId.isValid(i)).map(i => Types.ObjectId(i)) }
    // if(ingredients) filters['ingredients.food.name'] = { $all: ingredients } not work

    console.debug(filters)
    return filters
}

export enum RecipeType {
    SHARED = "shared",
    SAVED = "saved",
    LOVED = "loved",
    "SHARED_IN_CHAT" = "shared-in-chat"
}
export namespace RecipeType {
    export function values(): RecipeType[] {
        return valuesOfEnum(RecipeType, "string")
    }

    export function isLoved(value: string): boolean {
        return value as RecipeType === RecipeType.LOVED
    }

    export function includes(value: string): boolean {
        return RecipeType.values().includes(value as RecipeType)
    }
}

export enum UpdateAction {
    PERMISSION = "permission"
}
export namespace UpdateAction {
    export function isPermissionType(type: string): boolean {
        return type as UpdateAction === UpdateAction.PERMISSION
    }
}

export function uploadImageAndTutorial(): Middleware {
    return function (req, res, next) {

        const _maxImage = 1
        const _maxTutorial = 1

        const _configurationImage: UploaderConfiguration = {
            type: FileType.IMAGE,
            dest: FilesystemResource.RECIPES.Image(),
            newFileName: function (file: any) {
                return "recipe-" + randomString(30) + path.extname(file.originalname)
            }
        }

        const _configurationVideo: UploaderConfiguration = {
            type: FileType.VIDEO,
            dest: FilesystemResource.RECIPES.Video(),
            newFileName: function (file: any) {
                return "recipe-tutorial-" + randomString(30) + path.extname(file.originalname)
            }
        }

        wrapUpload(
            fileUploader.mixed(
                [
                    { name: "img", maxCount: _maxImage, type: FileType.IMAGE },
                    { name: "tutorial", maxCount: _maxTutorial, type: FileType.VIDEO }
                ],
                [_configurationImage, _configurationVideo])
        )(req, req, err => {
            if (err) return next(err)
            if (req.files) {
                console.debug(req.files)
                const fileImage = req.files["img"]
                if (fileImage?.length === _maxImage) {
                    Object.assign(req.body, { img: fileImage[0].filename })
                }
                const fileVideo = req.files["tutorial"]
                if (fileVideo?.length === _maxTutorial) {
                    Object.assign(req.body, { tutorial: fileVideo[0].filename })
                }
            }
            next()
        })
    }
}

export function checkAndFormatBody(): Middleware {
    return async function (req, res, next): Promise<any> {
        if (req.body.ingredients) {
            try {
                req.body.ingredients = decodeToArray(req.body.ingredients)
                if (!req.body.ingredients.every(i => i.food && i.quantity))
                    return next({ status: 400, description: "Elements of 'Ingredients' must be of the form : { food: string, quantity: number }" })
                await existById(Food, req.body.ingredients.map(p => p.food))
            } catch (e) {
                if (Array.isArray(e)) {
                    return next({ status: 404, description: "Foods [" + e + "] are not founds." })
                } else {
                    return next({ status: 400, description: "Ingredients must be array and have at least one element." })
                }
            }
        }

        delete req.body.permission
        delete req.body.owner
        delete req.body.likes
        delete req.body.comments

        console.debug(req.body)
        next()
    }
}

export function create(): Middlewares {
    return [
        checkRequestHeaders({ "content-type": "multipart/form-data" }),
        checkRestrictedRBAC({
            operation: Operation.CREATE,
            resource: RBAC.Resource.RECIPE,
            others: (decodedToken, paramId) => decodedToken._id != paramId
        }),
        function (req, res, next) {
            const { id } = req.params
            if (!Types.ObjectId.isValid(id)) return next({ status: 400, description: "Required a valid 'id'" })

            return existById(User, [id]).then(() => next(), ids => next({ status: 404, description: "User ("+ids[0]+") is not found." }))
        },
        uploadImageAndTutorial(), /* for update image and/or tutorial*/
        function (req, res, next) {
            checkAndFormatBody()(req, res, err => {
                if (err) return next(err)
                Object.assign(req.body, { owner: req.params.id })
                next()
            })
        }
    ]
}

export function all(): Middlewares {
    return [
        checkNormalRBAC(),
        function (req, res, next) {
            req.locals.filters = getFilters(req.query)
            next()
        }
    ]
}

export function oneShared(): Middlewares {
    return [
        checkNormalRBAC(),
        function (req, res, next) {
            if (!Types.ObjectId.isValid(req.params.recipeID))
                return next({ status: 400, description: "Required a valid 'recipeID'" })
            next()
        }
    ]
}

export function numberRecipesForCountry(): Middlewares {
    return checkNormalRBAC()
}

export function erase(): Middlewares {
    return [
        checkRestrictedRBAC({
            operation: Operation.DELETE,
            resource: RBAC.Resource.RECIPE
        }),
        function (req, res, next) {
            const { id, recipeID } = req.params
            if (!Types.ObjectId.isValid(id))  return next({ status: 400, description: "Required a valid 'id'" })
            if (!Types.ObjectId.isValid(recipeID))  return next({ status: 400, description: "Required a valid 'recipeID'" })
            next()
        }
    ]
}

export function update(): Middlewares {
    return [
        function (req, res, next) {
            checkRequestHeaders({ "content-type": UpdateAction.isPermissionType(req.query.field) ? "application/json" : "multipart/form-data" })(req, res, next)
        },
        checkRestrictedRBAC({
            operation: Operation.UPDATE,
            resource: RBAC.Resource.RECIPE
        }),
        function (req, res, next) {
            const { id, recipeID } = req.params
            if (!Types.ObjectId.isValid(id)) return next({ status: 400, description: "Required a valid 'id'" })
            if (!Types.ObjectId.isValid(recipeID)) return next({ status: 400, description: "Required a valid 'recipeID'" })

            switch (req.query.field as UpdateAction) {
                case UpdateAction.PERMISSION: {
                    const errMsEmpty = "Permission must be array and have at least one element"
                    const permission = req.body.permission

                    if (!permission) return next({ status: 400, description:  errMsEmpty })
                    const _availableGranted = IPermission.GrantedType.values().map(g => g.toString())
                    _availableGranted.push("revoke")
                    if (!permission.every(p => p.user))
                        return next({
                            status: 400,
                            description: "Elements of 'Permission' must be of the form : { user: string, granted?: string } with granted in " + _availableGranted
                        })

                    console.debug(permission)

                    return existById(User, permission.map(p => p.user))
                        .then(() => next(), err => {
                            if (Array.isArray(err)) next({ status: 404, description: "Users [" + err +"] are not founds." })
                            else next({ status: 400, description: errMsEmpty })
                        })
                }
                default: {
                    checkAndFormatBody()(req, res, next)
                }
            }
        },
        uploadImageAndTutorial(),  /* for update image and/or tutorial*/
        function (req, res, next) {
            if (Object.keys(req.body).length === 0)
                return next({
                    status: 400,
                    description: "Required body have to contain: "+
                                "img?: string, tutorial?: string, "+
                                "name?: string, ingredients?: array, preparation?: string note?: string, "+
                                "shared?: boolean, country?: string, category?: string, diet?: string"
                })
            next()
        }
    ]
}

export function list(): Middlewares {
    return [
        function (req, res, next) {
            const { type } = req.query
            if (type === "shared") checkNormalRBAC()(req, res, next)
            else
                checkRestrictedRBAC({
                    operation: Operation.RETRIEVE,
                    resource: RBAC.Resource.RECIPE,
                    others: (decodedToken, paramId) => decodedToken._id != paramId
                })(req, res, next)
        },
        function (req, res, next) {
            const { id } = req.params
            if (!Types.ObjectId.isValid(id))  return next({ status: 400, description: "Required a valid 'id'" })

            const { type } = req.query
            if (type !== undefined && !RecipeType.includes(type))
                return next({ status: 400, description: "Required 'type' include in [" + RecipeType + "] or not set" })

            console.debug({ ...req.params, ...req.query })

            return existById(User, [id])
                .then(() => {
                    req.locals.filters = getFilters(req.query, id)
                    next()
                }, ids => next({ status: 404, description: "User ("+ids[0]+") is not found." }))
        }
    ]
}

export function one(): Middlewares {
    return [
        function (req, res, next) {
            const { type } = req.query
            if (type === "shared") {
                const filters = { owner: req.params.id }
                if (!req.locals) req.locals = { filters }
                else req.locals.filters = filters
                checkNormalRBAC()(req, res, next)
            } else {
                checkRestrictedRBAC({
                    operation: Operation.RETRIEVE,
                    resource: RBAC.Resource.RECIPE,
                    others: (decodedToken, paramId) => decodedToken._id != paramId
                })(req, res, next)
            }
        },
        function (req, res, next) {
            const { id, recipeID } = req.params
            if (!Types.ObjectId.isValid(id))  return next({ status: 400, description: "Required a valid 'id'" })
            if (!Types.ObjectId.isValid(recipeID))  return next({ status: 400, description: "Required a valid 'recipeID'" })
            console.debug({ ...req.params, ...req.query })
            next()
        }
    ]
}
