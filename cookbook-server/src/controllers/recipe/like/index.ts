import {
    Like,
    Recipe
} from "../../../models"
import { IRecipe } from "../../../models/schemas/recipe"
import { IComment } from "../../../models/schemas/recipe/comment"

function _addLike(doc: IRecipe | IComment, user: string, res: any): void {
    if (user && doc.likes.find(l => l.user && l.user._id == user)) return res.status(409).json({ description: "You have already liked it." })
    const like = new Like({ user })
    doc.likes.push(like)
    doc
        .save()
        .then(() => {
            like.populate({
                path: "user",
                select: { userID: "$credential.userID" }
            }, (err, _like) => {
                if (err) return res.status(500).json({ description: err.message })
                return res.status(201).json(_like)
            })
        }, err => res.status(500).json({ code: err.code || 0, description: err.message }))
}

function _removeLike(doc: IRecipe | IComment, index: number, res: any): void {
    doc.likes.splice(index, 1)

    doc.save()
        .then(
            () => res.status(200).json({ description: "Like has been removed." }),
            err => res.status(500).json({ code: err.code || 0, description: err.message })
        )
}

function addLikeOnRecipe(req: any, res: any): void {
    const { id, recipeID } = req.params
    const user = req.locals.user?._id
    Recipe
        .findOne()
        .where("_id")
        .equals(recipeID)
        .where("owner")
        .equals(id)
        .where("shared")
        .equals(true)
        .then(recipe => {
            if (!recipe) return res.status(404).json({ description: "Recipe is not found." })
            return _addLike(recipe, user, res)
        }, err => res.status(500).json({ code: err.code || 0, description: err.message }))
}

function removeLikeOnRecipe(req: any, res: any): void {
    const { id, recipeID, likeID } = req.params
    const user = req.locals.user?._id
    Recipe
        .findOne()
        .where("_id")
        .equals(recipeID)
        .where("owner")
        .equals(id)
        .where("shared")
        .equals(true)
        .where("likes.user")
        .equals(user)
        .where("likes._id")
        .equals(likeID)
        .then(recipe => {
            if (!recipe) return res.status(404).json({ description: "Like is not found" })
            return _removeLike(recipe, recipe.likes.findIndex(l => l._id == likeID), res)
        }, err => res.status(500).json({ code: err.code || 0, description: err.message }))
}

function addLikeOnComment(req: any, res: any): void {
    const user = req.locals.user?._id
    const comment = req.locals.comment
    _addLike(comment, user, res)
}

function removeLikeOnComment(req: any, res: any): void {
    const comment = req.locals.comment
    const like = req.locals.like
    _removeLike(comment, comment.likes.indexOf(like), res)
}

enum LikeAction {
    ADD, REMOVE
}

function select(req: any, res: any, likeAction: LikeAction): void {
    const { commentID } = req.query
    switch (likeAction) {
        case LikeAction.REMOVE:
            if (commentID) return removeLikeOnComment(req, res)
            else return removeLikeOnRecipe(req, res)
        case LikeAction.ADD:
            if (commentID) return addLikeOnComment(req, res)
            else return addLikeOnRecipe(req, res)
    }
}

export function addLike(req, res) {
    select(req, res, LikeAction.ADD)
}
export function removeLike(req, res) {
    select(req, res, LikeAction.REMOVE)
}
