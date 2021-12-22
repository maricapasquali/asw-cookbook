import * as notificationController from '../../controllers/notification'

export default function (app) {

    app.route('/api/users/:id/notifications')
       .get(notificationController.list_notification)

    app.route('/api/users/:id/notifications/:notificationID')
       .patch(notificationController.update_notification)
       .delete(notificationController.delete_notification)

}