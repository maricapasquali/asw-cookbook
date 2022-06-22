import {
    checkNormalRBAC,
    Middlewares
} from "../../base"
import { RBAC } from "../../../libs/rbac"
import { Types } from "mongoose"
import { retrieveComment } from "../comment"
import Operation = RBAC.Operation
import Resource = RBAC.Resource

function addLikeOnRecipe(req, res, next) {
    checkNormalRBAC({
        operation: Operation.CREATE,
        resource: Resource.LIKE,
        others: (decodedToken, paramId) => decodedToken._id == paramId
    })(req, res, next)
}

function removeLikeOnRecipe(req, res, next) {
    checkNormalRBAC({
        operation: Operation.DELETE,
        resource: Resource.LIKE,
        others: (decodedToken, paramId) => decodedToken._id == paramId
    })(req, res, next)
}

function addLikeOnComment(req, res, next) {
    retrieveComment()(req, res, (err?: any): any => {
        if (err) return next(err)
        const comment = req.locals.comment
        return checkNormalRBAC({
            operation: Operation.CREATE,
            resource: Resource.LIKE,
            others: decodedToken => (comment.user && decodedToken._id == comment.user._id)
        })(req, res, next)
    })
}

function removeLikeOnComment(req, res, next) {
    retrieveComment()(req, res, (err?: any): any => {
        if (err) return next(err)
        const comment = req.locals.comment
        const like = comment.likes.find(l => l._id == req.params.likeID)
        if (!like) return next({ status: 404, description: "Like is not found" })
        req.locals.like = like
        return checkNormalRBAC({
            operation: Operation.DELETE,
            resource: Resource.LIKE,
            others: decodedToken => (decodedToken && like.user._id != decodedToken._id)
        })(req, res, next)
    })
}

export function add(): Middlewares {
    return function (req, res, next) {
        const { recipeID } = req.params
        if (!Types.ObjectId.isValid(recipeID)) return next({ status: 400, description: "Required a valid 'recipeID'" })

        const { commentID } = req.query
        if (commentID) {
            req.params.commentID = commentID
            addLikeOnComment(req, res, next)
        } else addLikeOnRecipe(req, res, next)
    }
}

export function remove(): Middlewares {
    return function (req, res, next) {
        const { recipeID, likeID } = req.params
        if (!Types.ObjectId.isValid(recipeID)) return next({ status: 400, description: "Required a valid 'recipeID'" })
        if (!Types.ObjectId.isValid(likeID)) return res.status(400).json({ description: "Required a valid 'likeID'" })

        const { commentID } = req.query
        if (commentID) {
            req.params.commentID = commentID
            removeLikeOnComment(req, res, next)
        } else removeLikeOnRecipe(req, res, next)
    }
}
