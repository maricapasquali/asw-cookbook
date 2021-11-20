import * as likeController from '../../../controllers/recipe/like'

export default function (app){
    app.route('/api/users/:id/recipes/:recipesID/likes')
        .post(likeController.add_like)
        .get(likeController.list_likes)

    app.route('/api/users/:id/recipes/:recipesID/likes/:likes')
        .delete(likeController.remove_like)
}