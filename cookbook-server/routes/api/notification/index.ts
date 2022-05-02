import {notificationController} from '../../../controllers'
import {notificationMiddleware} from '../../../middlewares'

export default function (app) {

    app.route('/api/users/:id/notifications')
       .get(notificationMiddleware.list(), notificationController.list_notification)

    app.route('/api/users/:id/notifications/:notificationID')
       .patch(notificationMiddleware.update(), notificationController.update_notification)
       .delete(notificationMiddleware.erase(), notificationController.delete_notification)

}