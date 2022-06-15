import { recipeController } from "../../../controllers"
import { recipeMiddleware } from "../../../middlewares"
import likeRoute from "./like"
import commentRoute from "./comment"

export default function (app) {
    // for ALL users
    app.route("/api/recipes")
        .get(recipeMiddleware.all(), recipeController.listAllRecipes)
    app.route("/api/recipes/:recipeID")
        .get(recipeMiddleware.oneShared(), recipeController.oneSharedRecipe)

    app.route("/api/recipes-for-country")
        .get(recipeMiddleware.numberRecipesForCountry(), recipeController.numberRecipesForCountry)

    // for specific user
    app.route("/api/users/:id/recipes")
        .post(recipeMiddleware.create(), recipeController.createRecipe)
        .get(recipeMiddleware.list(), recipeController.listRecipes)

    app.route("/api/users/:id/recipes/:recipeID")
        .patch(recipeMiddleware.update(), recipeController.updateRecipe)
        .delete(recipeMiddleware.erase(), recipeController.deleteRecipe)
        .get(recipeMiddleware.one(), recipeController.oneRecipe)

    commentRoute(app)
    likeRoute(app)
}
