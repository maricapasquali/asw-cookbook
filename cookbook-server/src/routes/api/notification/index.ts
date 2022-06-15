import { notificationController } from "../../../controllers"
import { notificationMiddleware } from "../../../middlewares"

export default function (app) {
    app.route("/api/users/:id/notifications")
        .get(notificationMiddleware.list(), notificationController.listNotification)

    app.route("/api/users/:id/notifications/:notificationID")
        .patch(notificationMiddleware.update(), notificationController.updateNotification)
        .delete(notificationMiddleware.erase(), notificationController.deleteNotification)
}
