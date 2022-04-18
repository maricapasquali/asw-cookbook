import {userController} from '../../controllers'
import {userMiddleware} from '../../middlewares'
import sessionRoute from "./session";

export default function (app) {

    app.route('/api/users')
        .post(userMiddleware.uploadProfileImage(), userController.create_user)
        .get(userMiddleware.all_user(), userController.all_users)
        .put(userController.check_account)

    app.route('/api/users/:id')
        .get(userMiddleware.one(), userController.one_user)
        .patch(userMiddleware.update_user(), userMiddleware.uploadProfileImage(), userController.update_user)
        .delete(userMiddleware.erase(), userController.delete_user)

    app.route('/api/users/:id/credentials')
       .patch(userMiddleware.update_credential(), userController.update_credential_user)

    app.route('/api/reset-password/email')
        .get(userController.send_email_password)
    app.route('/api/reset-password/check-link')
        .get(userController.checkLinkResetPassword)
    app.route('/api/reset-password/users')
        .get(userController.foundUserForNickname)

    sessionRoute(app)
}