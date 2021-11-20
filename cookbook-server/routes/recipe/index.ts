import * as recipeController from '../../controllers/recipe'

export default function (app) {

    app.route('/api/users/:id/recipes')
        //.all(recipeController.uploadImageOrTutorial()) // for upload image and/or tutorial
        .post(recipeController.create_recipe)
        .get(recipeController.list_recipes)

    app.route('/api/users/:id/recipes/:recipeID')
        .get(recipeController.one_recipe)

    app.route('/api/recipes-for-country').get(recipeController.numberRecipesForCountry)

    app.route('/api/users/:id/recipes/:type')
        .get(recipeController.private_version_recipes)

    app.route('/api/users/:id/recipes/:type/:recipeID')
        // .all(recipeController.uploadImageOrTutorial()) // for update image and/or tutorial
        .patch(recipeController.update_recipe) // only shared and saved
        .get(recipeController.private_version_one_recipe)
        .delete(recipeController.delete_recipe)
}