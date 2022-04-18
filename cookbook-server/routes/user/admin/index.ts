import {adminController} from '../../../controllers'
import {userMiddleware} from "../../../middlewares";

export default function (app) {
    app.route('/api/admins')
       .post(userMiddleware.uploadProfileImage(), adminController.signup)
}