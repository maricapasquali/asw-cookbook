import * as recipeController from '../../controllers/recipe'
import likeRoute from "./like";
import commentRoute from "./comment";

export default function (app) {
    // for ALL users
    app.route('/api/recipes')
       .get(recipeController.list_all_recipes)

    app.route('/api/recipes-for-country')
       .get(recipeController.numberRecipesForCountry)

    // for specific user
    app.route('/api/users/:id/recipes')
       .all(recipeController.uploadImageAndTutorial()) // for upload image and/or tutorial
       .post(recipeController.create_recipe)
       .get(recipeController.list_recipes)

    app.route('/api/users/:id/recipes/:recipeID')
       .all(recipeController.uploadImageAndTutorial()) // for update image and/or tutorial
       .patch(recipeController.update_recipe)
       .delete(recipeController.delete_recipe)
       .get(recipeController.one_recipe)

    commentRoute(app)
    likeRoute(app)
}