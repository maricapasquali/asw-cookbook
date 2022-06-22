import { chatController } from "../../../controllers"
import { chatMiddleware } from "../../../middlewares"
import messageRoute from "./message"

export default function (app) {
    app.route("/api/users/:id/chats")
        .post(chatMiddleware.create(), chatController.createChat)
        .get(chatMiddleware.list(), chatController.listChat)

    app.route("/api/users/:id/chats/:chatID")
        .get(chatMiddleware.one(), chatController.chat)
        .delete(chatMiddleware.erase(), chatController.deleteChat)
        .patch(chatMiddleware.update(), chatController.updateChat)

    messageRoute(app)
}
