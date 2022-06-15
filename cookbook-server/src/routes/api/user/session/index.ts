import { sessionController as userSessionController } from "../../../../controllers"
import { sessionMiddleware } from "../../../../middlewares"

export default function (app: any) {
    app.route("/api/users/login")
        .post(sessionMiddleware.login(), userSessionController.login)

    app.route("/api/users/:id/logout")
        .delete(sessionMiddleware.logout(), userSessionController.logout)

    app.route("/api/users/:id/refresh-token")
        .put(sessionMiddleware.updateAccessToken(), userSessionController.updateAccessToken)
}
