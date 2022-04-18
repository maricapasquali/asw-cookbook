import {commentController} from '../../../controllers'
import {commentMiddleware} from '../../../middlewares'

export default function (app){

    app.route('/api/comments-reported')
       .get(commentMiddleware.list_reported(), commentController.list_reported_comments)

    app.route('/api/users/:id/recipes/:recipeID/comments')
        .post(commentMiddleware.writeCommentOnRecipe(), commentController.writeComment)

    app.route('/api/users/:id/recipes/:recipeID/comments/:commentID')
        .patch(commentMiddleware.update(), commentController.update_comment)
        .delete(commentMiddleware.remove(), commentController.remove_comment)

    app.route('/api/users/:id/recipes/:recipeID/comments/:commentID/responses')
       .post(commentMiddleware.writeResponseOnComment(), commentController.writeComment)
}