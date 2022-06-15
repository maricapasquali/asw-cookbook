import { friendController } from "../../../../controllers"
import { friendMiddleware } from "../../../../middlewares"

export default function (app) {
    app.route("/api/users/:id/friends")
        .post(friendMiddleware.create(), friendController.requestFriendship)
        .get(friendMiddleware.list(), friendController.listFriends)

    app.route("/api/users/:id/friends/:friendID")
        .patch(friendMiddleware.update(), friendController.updateFriendship)
        .delete(friendMiddleware.erase(), friendController.removeFriend)
}
