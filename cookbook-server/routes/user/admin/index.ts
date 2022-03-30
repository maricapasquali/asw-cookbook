import * as adminController from '../../../controllers/user/admin'
import * as userController from "../../../controllers/user";

export default function (app) {
    app.route('/api/admins')
       .all(userController.uploadProfileImage())
       .post(adminController.signup)
}