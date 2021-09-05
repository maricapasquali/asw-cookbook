import * as userController from '../../controllers/user'

export default function (app) {

    app.route('/api/users').all(userController.uploadProfileImage())
        .post(userController.create_user)
        .get(userController.all_users)
        .patch(userController.reset_password)

    app.route('/api/users/check-account').put(userController.check_account)

    app.route('/api/users/authorized/:id').get(userController.check_authorization)

    app.route('/api/users/login').post(userController.login)

    app.route('/api/users/emails/reset-password').get(userController.send_email_password)

    app.route('/api/users/:id').all(userController.uploadProfileImage())
        .get(userController.one_user)
        .patch(userController.update_user)
        .delete(userController.delete_user)

    app.route('/api/users/:id/state').get(userController.state_user)

    app.route('/api/users/:id/credentials').patch(userController.update_credential_user)

    app.route('/api/users/:id/logout').delete(userController.logout)

    app.route('/api/users/:id/refreshToken').post(userController.update_access_token)
}