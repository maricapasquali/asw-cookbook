import { userController } from "../../../controllers"
import { userMiddleware } from "../../../middlewares"
import sessionRoute from "./session"

export default function (app) {
    app.route("/api/users")
        .post(userMiddleware.create(), userController.createUser)
        .get(userMiddleware.allUser(), userController.allUsers)
        .put(userMiddleware.checkAccount(), userController.checkAccount)

    app.route("/api/users/:id")
        .get(userMiddleware.one(), userController.oneUser)
        .patch(userMiddleware.updateUser(), userController.updateUser)
        .delete(userMiddleware.erase(), userController.deleteUser)

    app.route("/api/users/:id/credentials")
        .patch(userMiddleware.updateCredential(), userController.updateCredentialUser)

    app.route("/api/reset-password/email")
        .get(userMiddleware.sendEmailPassword(), userController.sendEmailPassword)
    app.route("/api/reset-password/check-link")
        .get(userMiddleware.checkLinkResetPassword(), userController.checkLinkResetPassword)
    app.route("/api/reset-password/users")
        .get(userMiddleware.foundUserForNickname(), userController.foundUserForNickname)

    sessionRoute(app)
}
