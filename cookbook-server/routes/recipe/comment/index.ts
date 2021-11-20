import * as commentController from '../../../controllers/recipe/comment'

export default function (app){
    app.route('/api/users/:id/recipes/:recipeID/comments')
        .post(commentController.comment)
        .get(commentController.list_comments)

    app.route('/api/users/:id/recipes/:recipeID/comments/:commentID')
        .patch(commentController.response)
        .delete(commentController.remove_comment)
}