import {getUser} from "../../utils.controller";
import {RBAC} from "../../../modules/rbac";
import {Like, Recipe} from "../../../models";
import {Types} from "mongoose";
import Operation = RBAC.Operation;
import Subject = RBAC.Subject;
import {getComment} from "../comment";
import {DecodedTokenType} from "../../../modules/jwt.token";
import {IRecipe} from "../../../models/schemas/recipe";
import {IComment} from "../../../models/schemas/recipe/comment";

function _getUserFromAuthorization(req: any, res: any, options: {operation: Operation, others?: (decodedToken: DecodedTokenType) => boolean}): Promise<string | undefined>{
    return getUser(req, res, {operation: options.operation, subject: Subject.LIKE, others: options.others})
            .then(decodeToken => Promise.resolve(decodeToken? decodeToken._id : undefined))
}

function _getUser(req: any, res: any, options: {operation: Operation}): Promise<string>{
    return  _getUserFromAuthorization(req, res, {operation: options.operation, others: (decodedToken => decodedToken._id ==  req.params.id)});
}

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
    let {id, recipeID} = req.params
    if(!Types.ObjectId.isValid(id)) return res.status(400).json({ description: 'Required a valid \'id\''})
    if(!Types.ObjectId.isValid(recipeID)) return res.status(400).json({ description: 'Required a valid \'recipeID\''})
    _getUser(req, res, {operation: Operation.CREATE})
        .then(user => {
            Recipe.findOne()
                  .where('_id').equals(recipeID)
                  .where('owner').equals(id)
                  .where('shared').equals(true)
                  .then(recipe => {
                      if(!recipe) return res.status(404).json({description: 'Recipe is not found.'})
                      return addLike(recipe, user, res)
                 }, err => res.status(500).json({code: err.code || 0 , description: err.message}))
        }, err => console.error(err))
}

function remove_like_on_recipe(req, res){
    let {id, recipeID, likeID} = req.params
    if(!Types.ObjectId.isValid(id)) return res.status(400).json({ description: 'Required a valid \'id\''})
    if(!Types.ObjectId.isValid(recipeID)) return res.status(400).json({ description: 'Required a valid \'recipeID\''})
    if(!Types.ObjectId.isValid(likeID)) return res.status(400).json({ description: 'Required a valid \'likeID\''})

    _getUser(req, res, {operation: Operation.DELETE})
        .then(user => {
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

        }, err => console.error(err))
}

function add_like_on_comment(req, res){
    let {id, recipeID, commentID} = req.params
    if(!Types.ObjectId.isValid(id)) return res.status(400).json({ description: 'Required a valid \'id\''})
    if(!Types.ObjectId.isValid(recipeID)) return res.status(400).json({ description: 'Required a valid \'recipeID\''})
    if(!Types.ObjectId.isValid(commentID)) return res.status(400).json({ description: 'Required a valid \'commentID\''})

    getComment(req, res)
        .then(comment => {
            console.log(comment.user)
            _getUserFromAuthorization(req, res, { operation: Operation.CREATE, others: decodedToken => (comment.user && decodedToken._id == comment.user._id) })
                .then(user => addLike(comment, user, res),
                      err => console.error(err))
        }, err => console.error(err))
}

function remove_like_on_comment(req, res){
    let {id, recipeID, commentID, likeID} = req.params
    if(!Types.ObjectId.isValid(id)) return res.status(400).json({ description: 'Required a valid \'id\''})
    if(!Types.ObjectId.isValid(recipeID)) return res.status(400).json({ description: 'Required a valid \'recipeID\''})
    if(!Types.ObjectId.isValid(commentID)) return res.status(400).json({ description: 'Required a valid \'commentID\''})
    if(!Types.ObjectId.isValid(likeID)) return res.status(400).json({ description: 'Required a valid \'likeID\''})

    getComment(req, res)
        .then(comment => {
            const like = comment.likes.find(l => l._id == likeID)
            if(!like) return res.status(404).json({description: 'Like is not found'})
            console.log(like)
            _getUserFromAuthorization(req, res, { operation: Operation.DELETE, others: decodedToken => (decodedToken && like.user._id != decodedToken._id) })
                .then(user => removeLike(comment, comment.likes.indexOf(like), res),
                      err => console.error(err))
        }, err => console.error(err))
}

enum LikeAction {
    ADD, REMOVE
}

function select(req: any, res: any, likeAction: LikeAction): any{
    let {commentID} = req.query
    req.params.commentID = commentID
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
