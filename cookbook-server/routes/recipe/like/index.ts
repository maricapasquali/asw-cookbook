import * as likeController from '../../../controllers/recipe/like'

export default function (app){
    app.route('/api/users/:id/recipes/:recipeID/likes')
        .post(likeController.add_like)

    app.route('/api/users/:id/recipes/:recipeID/likes/:likeID')
        .delete(likeController.remove_like)
}