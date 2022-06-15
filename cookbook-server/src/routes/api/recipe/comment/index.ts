import { commentController } from "../../../../controllers"
import { commentMiddleware } from "../../../../middlewares"

export default function (app) {
    app.route("/api/comments-reported")
        .get(commentMiddleware.listReported(), commentController.listReportedComments)

    app.route("/api/users/:id/recipes/:recipeID/comments")
        .post(commentMiddleware.writeCommentOnRecipe(), commentController.writeComment)

    app.route("/api/users/:id/recipes/:recipeID/comments/:commentID")
        .patch(commentMiddleware.update(), commentController.updateComment)
        .delete(commentMiddleware.remove(), commentController.removeComment)

    app.route("/api/users/:id/recipes/:recipeID/comments/:commentID/responses")
        .post(commentMiddleware.writeResponseOnComment(), commentController.writeComment)
}
