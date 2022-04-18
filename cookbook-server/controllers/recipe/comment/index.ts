import {Comment, Recipe, Report, User} from "../../../models";
import {MongooseValidationError} from "../../../modules/custom.errors";
import {Types} from "mongoose";
import {IComment} from "../../../models/schemas/recipe/comment";
import {IRecipe} from "../../../models/schemas/recipe";
import {UpdateAction} from "../../../middlewares/recipe/comment";

const PopulationSelectUserComment = { userID: '$credential.userID', img: '$information.img' }

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
                    .then(doc => {
                            _doc.populate({ path: 'user', select: PopulationSelectUserComment },function (err, populateComment){
                                if(err) return res.status(500).json({description: err.message})
                                return res.status(201).json(populateComment)
                            })
                        },
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

    const user = req.locals.user?._id

    Recipe.findOne()
        .where('_id').equals(recipeID)
        .where('owner').equals(id)
        .where('shared').equals(true)
        .then(recipe => {

            if(!recipe) return res.status(404).json({description: 'Recipe is not found'})
            return addCommentOn(recipe, {body: req.body, user_id: user}, res)

        }, err => res.status(500).json({code: err.code || 0, description: err.message}))
}

function responseToComment(req: any, res: any){
    if(!req.body.content) return res.status(400).json({ description: 'Body must require field => \'content\': string'})
    const user = req.locals.user?._id
    const comment = req.locals.comment
    addCommentOn(comment, { body: req.body, user_id: user, recipe: req.params.recipeID }, res)
}

export function writeComment(req, res){
    if(req.params.commentID) return responseToComment(req, res)
    else return commentToRecipe(req, res)
}

function report(req, res){
    const user = req.locals.user?._id
    const comment = req.locals.comment
    if(user && comment.reported.find(r => r.user && r.user._id == user)) return res.status(204).send()
    comment.reported.push(new Report({user: user}))
    comment.save()
        .then(_doc => res.status(200).json({description: 'Comment has been reported.'}),
            err => res.status(500).json({code: err.code || 0, description: err.message}))
}

function unReport(req, res) {
    const comment = req.locals.comment
    if (comment.reported.length === 0) return res.status(404).json({description: 'Comment is not found'})
    comment.reported = []
    comment.save()
           .then(doc => res.status(200).json({description: 'Comment has been unreported.'}),
                 err => res.status(500).json({code: err.code || 0, description: err.message}))
}

function changeContentComment(req, res) {
    if(!req.body.content) return res.status(400).json({ description: 'Body must require field => \'content\': string'})

    const comment = req.locals.comment
    comment.content = req.body.content
    comment.save()
           .then(doc => res.status(200).json({description: 'Comment\'s content has been changed.'}),
                 err => res.status(500).json({code: err.code || 0, description: err.message}))
}

export function update_comment(req, res){
    const { action } = req.query
    switch (action as UpdateAction){
        case UpdateAction.REPORT: return report(req, res)
        case UpdateAction.UN_REPORT: return unReport(req, res)
        default: return changeContentComment(req, res)
    }
}

export function remove_comment(req, res){
    const user = req.locals.user
    const comment = req.locals.comment

    if(!accessManager.isSignedUser(user) && comment.reported.length === 0) return res.status(404).json({description: 'Comment is not found'})
    comment.content = ''
    comment.save()
            .then(_comment => {
                res.status(200).json({description: 'Comment content has been deleted.'})
                if(accessManager.isAdminUser(user) && _comment.user){
                    console.log('Strike to '+ _comment.user.userID)
                    User.updateOne({ _id: _comment.user._id }, { $inc : { strike: 1 } })
                        .then(result => console.log(result.n > 0 && result.nModified > 0 ? 'Add strike.': 'No ad strike'),
                            err => console.error(err))
                }
            }, err => res.status(500).json({code: err.code || 0, description: err.message}))

}

export function list_reported_comments(req, res){

    Comment.find()
        .where('reported').ne([])
        .populate([
            { path: 'recipe' },
            { path: 'reported.user', select: PopulationSelectUserComment }
        ])
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
