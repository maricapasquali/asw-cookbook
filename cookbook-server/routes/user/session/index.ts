import * as userSessionController from '../../../controllers/user/session'

export default function (app) {

    app.route('/api/users/login')
       .post(userSessionController.login)

    app.route('/api/users/:id/logout')
       .delete(userSessionController.logout)

    app.route('/api/users/:id/refresh-token')
       .put(userSessionController.update_access_token)

}