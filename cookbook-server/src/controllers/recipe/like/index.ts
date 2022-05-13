import {Like, Recipe} from "../../../models";
import {IRecipe} from "../../../models/schemas/recipe";
import {IComment} from "../../../models/schemas/recipe/comment";

function addLike(doc: IRecipe | IComment, user: string, res: any){
    if(user && doc.likes.find(l =>  l.user && l.user._id == user)) return res.status(409).json({description: 'You have already liked it.'})
    let like = new Like({ user: user })
    doc.likes.push(like)
    doc.save()
          .then(doc => {
                like.populate({
                    path: 'user',
                    select: { userID: '$credential.userID' }
                }, function (err, _like){
                    if(err) return res.status(500).json({description: err.message})
                    return res.status(201).json(_like)
                })
              },
                err => res.status(500).json({code: err.code || 0 , description: err.message}))
}

function removeLike(doc: IRecipe | IComment, index: number, res: any){
    doc.likes.splice(index, 1)

    doc.save()
        .then(_doc => res.status(200).json({description: 'Like has been removed.'}),
            err => res.status(500).json({code: err.code || 0 , description: err.message}))
}


function add_like_on_recipe(req, res){
    const {id, recipeID} = req.params
    const user = req.locals.user?._id
    Recipe.findOne()
        .where('_id').equals(recipeID)
        .where('owner').equals(id)
        .where('shared').equals(true)
        .then(recipe => {
            if(!recipe) return res.status(404).json({description: 'Recipe is not found.'})
            return addLike(recipe, user, res)
        }, err => res.status(500).json({code: err.code || 0 , description: err.message}))
}

function remove_like_on_recipe(req, res){
    const {id, recipeID, likeID} = req.params
    const user = req.locals.user?._id
    Recipe.findOne()
        .where('_id').equals(recipeID)
        .where('owner').equals(id)
        .where('shared').equals(true)
        .where('likes.user').equals(user)
        .where('likes._id').equals(likeID)
        .then(recipe => {
            if(!recipe) return res.status(404).json({description: 'Like is not found'})
            return removeLike(recipe, recipe.likes.findIndex(l => l._id == likeID), res)
        }, err => res.status(500).json({code: err.code || 0 , description: err.message}))
}

function add_like_on_comment(req, res){
    const user = req.locals.user?._id
    const comment = req.locals.comment
    addLike(comment, user, res)
}

function remove_like_on_comment(req, res){
    const comment = req.locals.comment
    const like = req.locals.like
    removeLike(comment, comment.likes.indexOf(like), res)
}

enum LikeAction {
    ADD, REMOVE
}

function select(req: any, res: any, likeAction: LikeAction): any{
    let {commentID} = req.query
    switch (likeAction) {
        case LikeAction.REMOVE:
            if(commentID) return remove_like_on_comment(req, res)
            else return remove_like_on_recipe(req, res)
        case LikeAction.ADD:
            if(commentID) return add_like_on_comment(req, res)
            else return add_like_on_recipe(req, res)
    }
}

export const add_like = (req, res) => select(req, res, LikeAction.ADD)
export const remove_like = (req, res) => select(req, res, LikeAction.REMOVE)
