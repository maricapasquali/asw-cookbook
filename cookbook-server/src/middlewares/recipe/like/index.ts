import {Middlewares, checkNormalRBAC} from "../../base";
import {RBAC} from "../../../libs/rbac";
import Operation = RBAC.Operation;
import Resource = RBAC.Resource;
import {Types} from "mongoose";
import {retrieveComment} from "../comment";

function add_like_on_recipe(req, res, next){
    checkNormalRBAC({
        operation: Operation.CREATE,
        resource: Resource.LIKE,
        others: ((decodedToken, param_id) => decodedToken._id == param_id)
    })(req, res, next)
}

function remove_like_on_recipe(req, res, next){
    checkNormalRBAC({
        operation: Operation.DELETE,
        resource: Resource.LIKE,
        others: ((decodedToken, param_id) => decodedToken._id == param_id)
    })(req, res, next)
}

function add_like_on_comment(req, res, next){
    retrieveComment()(req, res, (err?: any): any => {
        if(err) return next(err)
        const comment = req.locals.comment
        return checkNormalRBAC({
            operation: Operation.CREATE,
            resource: Resource.LIKE,
            others: decodedToken => (comment.user && decodedToken._id == comment.user._id)
        })(req, res, next)
    })
}

function remove_like_on_comment(req, res, next){
    retrieveComment()(req, res, (err?: any): any => {
        if(err) return next(err)
        const comment = req.locals.comment
        const like = comment.likes.find(l => l._id == req.params.likeID)
        if(!like) return next({status: 404, description: 'Like is not found'})
        req.locals.like = like
        return checkNormalRBAC({
            operation: Operation.DELETE,
            resource: Resource.LIKE,
            others: decodedToken => (decodedToken && like.user._id != decodedToken._id)
        })(req, res, next)
    })
}

export function add(): Middlewares {
    return function (req, res, next){
        let {recipeID} = req.params
        if(!Types.ObjectId.isValid(recipeID)) return next({status: 400, description: 'Required a valid \'recipeID\''})

        let {commentID} = req.query
        if(commentID) {
            req.params.commentID = commentID
            add_like_on_comment(req, res, next)
        }
        else add_like_on_recipe(req, res, next)
    }
}

export function remove(): Middlewares {
    return function (req, res, next){
        let {recipeID, likeID} = req.params
        if(!Types.ObjectId.isValid(recipeID)) return next({status: 400, description: 'Required a valid \'recipeID\''})
        if(!Types.ObjectId.isValid(likeID)) return res.status(400).json({ description: 'Required a valid \'likeID\''})

        let {commentID} = req.query
        if(commentID) {
            req.params.commentID = commentID
            remove_like_on_comment(req, res, next)
        }
        else remove_like_on_recipe(req, res, next)
    }
}
