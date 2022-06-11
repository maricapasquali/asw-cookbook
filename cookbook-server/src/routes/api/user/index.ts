import {userController} from '../../../controllers'
import {userMiddleware} from '../../../middlewares'
import sessionRoute from "./session";

export default function (app) {

    app.route('/api/users')
        .post(userMiddleware.create(), userController.create_user)
        .get(userMiddleware.all_user(), userController.all_users)
        .put(userMiddleware.check_account(), userController.check_account)

    app.route('/api/users/:id')
        .get(userMiddleware.one(), userController.one_user)
        .patch(userMiddleware.update_user(), userController.update_user)
        .delete(userMiddleware.erase(), userController.delete_user)

    app.route('/api/users/:id/credentials')
       .patch(userMiddleware.update_credential(), userController.update_credential_user)

    app.route('/api/reset-password/email')
        .get(userMiddleware.send_email_password(), userController.send_email_password)
    app.route('/api/reset-password/check-link')
        .get(userMiddleware.checkLinkResetPassword(), userController.checkLinkResetPassword)
    app.route('/api/reset-password/users')
        .get(userMiddleware.foundUserForNickname(), userController.foundUserForNickname)

    sessionRoute(app)
}