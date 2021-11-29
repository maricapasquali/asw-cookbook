import {Comment, Recipe, Report} from "../../../models";
import {accessManager, checkRequestHeaders, getUser, getRestrictedUser} from "../../index";
import {RBAC} from "../../../modules/rbac";
import {MongooseValidationError} from "../../../modules/custom.errors";
import {Types} from "mongoose";
import {IComment} from "../../../models/schemas/recipe/comment";
import {DecodedTokenType} from "../../../modules/jwt.token";
import Operation = RBAC.Operation;
import Subject = RBAC.Subject;
import {IRecipe} from "../../../models/schemas/recipe";

function _getUser(req: any, res: any, options: {operation: Operation, subject?: Subject, others?: (decodedToken: DecodedTokenType) => boolean}): Promise<string | undefined>{
    return getUser(req, res, { operation: options.operation, subject: options.subject || Subject.COMMENT, others: options.others})
            .then(decodedToken => Promise.resolve(decodedToken ? decodedToken._id : undefined))
}

export function getComment(req: any, res: any): Promise<IComment> {
    let {id, recipeID, commentID} = req.params
    if (!Types.ObjectId.isValid(id)) return res.status(400).json({description: 'Required a valid \'id\''})
    if (!Types.ObjectId.isValid(recipeID)) return res.status(400).json({description: 'Required a valid \'recipeID\''})
    if (!Types.ObjectId.isValid(commentID)) return res.status(400).json({description: 'Required a valid \'commentID\''})

    return Comment.findOne()
                  .where('recipe').equals(recipeID)
                  .where('_id').equals(commentID)
                  .where('content').nin([undefined, ""])
                  .then(comment => {
                      if(!comment){
                        res.status(404).json({description: 'Comment is not found'})
                        return Promise.reject(404)
                      }
                      return Promise.resolve(comment)
                  }, err => res.status(500).json({code: err.code || 0, description: err.message}))
}

function addCommentOn(doc: IComment | IRecipe, options: {body: any, user_id: string, recipe?: string}, res: any){
    let {body, user_id, recipe} = options
    if(!(doc instanceof Recipe) && !options.recipe) throw new Error('Required in option also \'recipe\' ')
    body.user = user_id
    body.recipe = doc instanceof Recipe ? doc._id : recipe

    new Comment(body)
        .save()
        .then(_doc => {

                if(doc instanceof Comment)
                    doc.responses.push(_doc._id)
                else if(doc instanceof Recipe)
                    doc.comments.push(_doc._id)
                else res.status(500).json({description: 'doc is not formatted well.'})

                doc.save()
                    .then(doc => res.status(201).json(_doc),
                        err => res.status(500).json({code: err.code || 0, description: err.message}))
            },
            err => {
                if(MongooseValidationError.is(err)) return res.status(400).json({description: err.message})
                return res.status(500).json({code: err.code || 0, description: err.message})
            }
        )
}


function commentToRecipe(req: any, res: any){
    let {id, recipeID} = req.params
    if(!Types.ObjectId.isValid(id)) return res.status(400).json({ description: 'Required a valid \'id\''})
    if(!Types.ObjectId.isValid(recipeID)) return res.status(400).json({ description: 'Required a valid \'recipeID\''})
    if(!req.body.content) return res.status(400).json({ description: 'Body must require field => \'content\': string'})

    _getUser(req, res, {operation: Operation.CREATE})
        .then(user => {
            Recipe.findOne()
                .where('_id').equals(recipeID)
                .where('owner').equals(id)
                .where('shared').equals(true)
                .then(recipe => {

                    if(!recipe) return res.status(404).json({description: 'Recipe is not found'})
                    return addCommentOn(recipe, {body: req.body, user_id: user}, res)

                }, err => res.status(500).json({code: err.code || 0, description: err.message}))
        }, err => console.error(err))
}

function responseToComment(req: any, res: any){
    if(!req.body.content) return res.status(400).json({ description: 'Body must require field => \'content\': string'})

    getComment(req, res)
        .then(comment => {

            _getUser(req, res, {operation: Operation.CREATE, others: (decodedToken => comment.user && comment.user._id == decodedToken._id)})
                .then(user => addCommentOn(comment, { body: req.body, user_id: user, recipe: req.params.recipeID }, res),
                      err => console.error(err))

        }, err => console.error(err))
}

export function writeComment(req, res){
    if(checkRequestHeaders(req, res, {'content-type': 'application/json'})){
        if(req.params.commentID) return responseToComment(req, res)
        else return commentToRecipe(req, res)
    }
}

function report(req, res){
    getComment(req, res)
        .then((comment) => {

            _getUser(req, res, { operation: Operation.CREATE, subject: Subject.COMMENT_REPORT, others: decodedToken => comment.user && decodedToken._id == comment.user._id})
                .then(user => {
                    if(user && comment.reported.find(r => r.user && r.user._id == user)) return res.status(409).json({description: 'You have already reported it.'})
                    comment.reported.push(new Report({user: user}))
                    comment.save()
                        .then(_doc => res.status(200).json({description: 'Comment has been reported.'}),
                            err => res.status(500).json({code: err.code || 0, description: err.message}))

                }, err => console.error(err))

        },  err => console.error(err))
}

function unReport(req, res) {
    if(getRestrictedUser(req, res, {operation: Operation.DELETE, subject: Subject.COMMENT_REPORT, others: () => true})) {
        getComment(req, res)
            .then(comment => {
                if (comment.reported.length === 0) return res.status(404).json({description: 'Comment is not found'})
                comment.reported = []
                comment.save()
                    .then(doc => res.status(200).json({description: 'Comment has been unreported.'}),
                        err => res.status(500).json({code: err.code || 0, description: err.message}))
            }, err => console.error(err))
    }
}

function changeContentComment(req, res) {
    if(!req.body.content) return res.status(400).json({ description: 'Body must require field => \'content\': string'})
    getComment(req, res)
        .then(comment => {
            if(getRestrictedUser(req, res, {operation: Operation.UPDATE, subject: Subject.COMMENT, others: (decodedToken => !comment.user || decodedToken._id != comment.user._id)})) {

                comment.content = req.body.content
                comment.save()
                    .then(doc => res.status(200).json({description: 'Comment\'s content has been changed.'}),
                        err => res.status(500).json({code: err.code || 0, description: err.message}))

            }
        }, err => console.error(err))
}

enum UpdateAction {
    REPORT = 'report',
    UN_REPORT = 'un-report'
}
export function update_comment(req, res){
    if(checkRequestHeaders(req, res, {'content-type': 'application/json'})){
        const { action } = req.query
        switch (action as UpdateAction){
            case UpdateAction.REPORT: return report(req, res)
            case UpdateAction.UN_REPORT: return unReport(req, res)
            default: return changeContentComment(req, res)
        }
    }
}

export function remove_comment(req, res){
    getComment(req, res)
        .then(comment => {
            let user: DecodedTokenType | false = getRestrictedUser(req, res, {
                operation: Operation.DELETE,
                subject: Subject.COMMENT,
                others: (decodedToken => !comment.user || decodedToken._id != comment.user._id)
            })

            if(user){
                let {id, recipeID, commentID} = req.params
                if (!Types.ObjectId.isValid(id)) return res.status(400).json({description: 'Required a valid \'id\''})
                if (!Types.ObjectId.isValid(recipeID)) return res.status(400).json({description: 'Required a valid \'recipeID\''})
                if (!Types.ObjectId.isValid(commentID)) return res.status(400).json({description: 'Required a valid \'commentID\''})

                let filters = { recipe: recipeID, _id: commentID, reported:{ $ne: [] } }
                if(accessManager.isSignedUser(user)) delete filters.reported

                Comment.updateOne(filters, {$unset: {content: ''}})
                    .then(result => {
                        if(result.n === 0) return res.status(404).json({description: 'Comment is not found'})
                        if(result.nModified === 0) return res.status(500).json({description: 'Comment is found but it is not deleted.'})
                        return res.status(200).json({description: 'Comment content has been deleted.'})
                    }, err => res.status(500).json({code: err.code || 0, description: err.message}))

            }
        })

}

export function list_reported_comments(req, res){
    if(getRestrictedUser(req, res, {operation: Operation.RETRIEVE, subject: Subject.COMMENT, others: () => true})){

        Comment.find()
               .where('reported').ne([])
               .populate('recipe')
               .then(comments => {
                    return res.status(200).json(
                        comments.map(c => c.toObject()).map(c => {
                            c.recipe = {_id: c.recipe._id, owner: c.recipe.owner};
                            delete c.responses;
                            return c
                        })
                    )
                },err => res.status(500).json({code: err.code || 0, description: err.message}))
    }
}