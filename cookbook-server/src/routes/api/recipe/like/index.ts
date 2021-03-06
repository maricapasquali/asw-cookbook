import { likeController } from "../../../../controllers"
import { likeMiddleware } from "../../../../middlewares"

export default function (app) {
    app.route("/api/users/:id/recipes/:recipeID/likes")
        .post(likeMiddleware.add(), likeController.addLike)

    app.route("/api/users/:id/recipes/:recipeID/likes/:likeID")
        .delete(likeMiddleware.remove(), likeController.removeLike)
}
