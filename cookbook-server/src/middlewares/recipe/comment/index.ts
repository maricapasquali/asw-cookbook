import {checkRequestHeaders, Middlewares, checkNormalRBAC, checkRestrictedRBAC} from "../../base";
import {RBAC} from "../../../../modules/rbac";
import Operation = RBAC.Operation;
import Resource = RBAC.Resource;
import {Comment} from "../../../models";
import {Types} from "mongoose";

export enum UpdateAction {
    REPORT = 'report',
    UN_REPORT = 'un-report'
}

export function retrieveComment(req, res, next) {
    let {id, recipeID, commentID} = req.params
    if (!Types.ObjectId.isValid(id)) return next({status: 400, description: 'Required a valid \'id\''})
    if (!Types.ObjectId.isValid(recipeID)) return next({status: 400, description: 'Required a valid \'recipeID\''})
    if (!Types.ObjectId.isValid(commentID)) return next({status: 400, description: 'Required a valid \'commentID\''})
    Comment.findOne()
           .where('recipe').equals(recipeID)
           .where('_id').equals(commentID)
           .where('content').nin([undefined, ""])
           .then(comment => {
               if(!comment) return next({ status: 404, description: 'Comment is not found' })
               req.locals = req.locals || {}
               req.locals.comment = comment
               return next()
           }, err => next({status: 500, code: err.code || 0,  description: err.message}))
}

export function list_reported(): Middlewares {
    return checkRestrictedRBAC({
        operation: Operation.RETRIEVE,
        resource: Resource.COMMENT,
        others: () => true,
        ignoreValidationParamId: true
    })
}

export function writeCommentOnRecipe(): Middlewares {
    return [
        checkRequestHeaders({'content-type': 'application/json'}),
        checkNormalRBAC({
            operation: Operation.CREATE,
            resource: Resource.COMMENT
        })
    ]
}

export function writeResponseOnComment(): Middlewares {
    return [
        checkRequestHeaders({'content-type': 'application/json'}),
        retrieveComment,
        function (req, res, next) {
            const comment = req.locals.comment
            return checkNormalRBAC({
                operation: Operation.CREATE,
                resource: Resource.COMMENT,
                others: (decodedToken => comment.user && comment.user._id == decodedToken._id)
            })(req, res, next)
        }
    ]
}


export function update(): Middlewares {
    return  [
        checkRequestHeaders({'content-type': 'application/json'}),
        retrieveComment,
        function (req, res, next){
            const { action } = req.query
            const comment = req.locals.comment
            switch (action as UpdateAction){
                case UpdateAction.REPORT: {
                    return checkNormalRBAC({
                        operation: Operation.CREATE,
                        resource: Resource.COMMENT_REPORT,
                        others: decodedToken => comment.user && decodedToken._id == comment.user._id
                    })(req, res, next)
                }
                case UpdateAction.UN_REPORT:
                    return checkRestrictedRBAC({
                        operation: Operation.DELETE,
                        resource: Resource.COMMENT_REPORT,
                        others: () => true
                    })(req, res, next)
                default :
                    return checkRestrictedRBAC({
                        operation: Operation.UPDATE,
                        resource: Resource.COMMENT,
                        others: (decodedToken => !comment.user || decodedToken._id != comment.user._id)
                    })(req, res, next)
            }
        }
    ]
}

export function remove(): Middlewares {
    return [
        retrieveComment,
        function (req, res, next) {
            const comment = req.locals.comment
            return checkRestrictedRBAC({
                operation: Operation.DELETE,
                resource: Resource.COMMENT,
                others: (decodedToken => !comment.user || decodedToken._id != comment.user._id)
            })(req, res, next)
        }
    ]
}
