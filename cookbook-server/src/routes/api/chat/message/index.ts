import { messageController } from "../../../../controllers"
import { messageMiddleware } from "../../../../middlewares"

export default function (app) {
    app.route("/api/users/:id/chats/:chatID/messages")
        .post(messageMiddleware.send(), messageController.sendMessage)
        .put(messageMiddleware.readMessages(), messageController.readMessages)
        .get(messageMiddleware.list(), messageController.listMessages)

    app.route("/api/users/:id/chats/:chatID/messages/:messageID")
        .get(messageController.oneMessage)
        .put(messageController.changeContentMessage)
        .delete(messageController.deleteMessage)
}
