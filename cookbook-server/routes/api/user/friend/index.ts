import {friendController} from '../../../../controllers'
import {friendMiddleware} from '../../../../middlewares'

export default function (app) {

    app.route('/api/users/:id/friends')
       .post(friendMiddleware.create(), friendController.request_friendship)
       .get(friendMiddleware.list(), friendController.list_friends)

    app.route('/api/users/:id/friends/:friendID')
       .patch(friendMiddleware.update(), friendController.update_friendship)
       .delete(friendMiddleware.erase(), friendController.remove_friend)

}