import { adminController } from "../../../../controllers"
import { adminMiddleware } from "../../../../middlewares"

export default function (app) {
    app.route("/api/admins")
        .post(adminMiddleware.create(), adminController.signup)
}
