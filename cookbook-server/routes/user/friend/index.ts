import * as friendController from '../../../controllers/user/friend'

export default function (app) {

    app.route('/api/users/:id/friends')
       .post(friendController.request_friendship)
       .get(friendController.list_friends)

    app.route('/api/users/:id/friends/:friendID')
       .patch(friendController.update_friendship)
       .delete(friendController.remove_friend)

}