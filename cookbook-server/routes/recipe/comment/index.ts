import * as commentController from '../../../controllers/recipe/comment'

export default function (app){

    app.route('/api/comments-reported')
       .get(commentController.list_reported_comments)

    app.route('/api/users/:id/recipes/:recipeID/comments')
        .post(commentController.writeComment)

    app.route('/api/users/:id/recipes/:recipeID/comments/:commentID')
        .patch(commentController.update_comment)
        .delete(commentController.remove_comment)

    app.route('/api/users/:id/recipes/:recipeID/comments/:commentID/responses')
       .post(commentController.writeComment)
}