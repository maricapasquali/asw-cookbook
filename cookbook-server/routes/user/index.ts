import * as userController from '../../controllers/user'
import sessionRoute from "./session";

export default function (app) {

    app.route('/api/users').all(userController.uploadProfileImage())
        .post(userController.create_user)
        .get(userController.all_users)
        .put(userController.check_account)

    app.route('/api/users/:id').all(userController.uploadProfileImage())
        .get(userController.one_user)
        .patch(userController.update_user)
        .delete(userController.delete_user)

    app.route('/api/users/:id/credentials')
        .patch(userController.update_credential_user)

    app.route('/api/reset-password/email')
        .get(userController.send_email_password)
    app.route('/api/reset-password/check-link')
        .get(userController.checkLinkResetPassword)
    app.route('/api/reset-password/users')
        .get(userController.foundUserForNickname)

    sessionRoute(app)
}