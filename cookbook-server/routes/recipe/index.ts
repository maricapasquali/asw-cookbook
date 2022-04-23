import {recipeController} from '../../controllers'
import {recipeMiddleware} from '../../middlewares'
import likeRoute from "./like";
import commentRoute from "./comment";

export default function (app) {
    // for ALL users
    app.route('/api/recipes')
       .get(recipeMiddleware.all(), recipeController.list_all_recipes)
    app.route('/api/recipes/:recipeID')
       .get(recipeMiddleware.one_shared(), recipeController.one_shared_recipe)

    app.route('/api/recipes-for-country')
       .get(recipeMiddleware.numberRecipesForCountry(), recipeController.numberRecipesForCountry)

    // for specific user
    app.route('/api/users/:id/recipes')
       .post(recipeMiddleware.create(), recipeMiddleware.uploadImageAndTutorial() /* for update image and/or tutorial*/, recipeController.create_recipe)
       .get(recipeMiddleware.list(), recipeController.list_recipes)

    app.route('/api/users/:id/recipes/:recipeID')
       .patch(recipeMiddleware.update(), recipeMiddleware.uploadImageAndTutorial() /* for update image and/or tutorial*/, recipeController.update_recipe)
       .delete(recipeMiddleware.erase(), recipeController.delete_recipe)
       .get(recipeMiddleware.one(), recipeController.one_recipe)

    commentRoute(app)
    likeRoute(app)
}