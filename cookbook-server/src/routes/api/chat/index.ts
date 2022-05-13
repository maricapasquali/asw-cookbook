import {chatController} from '../../../controllers'
import {chatMiddleware} from '../../../middlewares'
import messageRoute from './message'

export default function(app) {

    app.route('/api/users/:id/chats')
        .post(chatMiddleware.create(), chatMiddleware.uploadChatImage(), chatController.create_chat)
        .get(chatMiddleware.list(), chatController.list_chat)

    app.route('/api/users/:id/chats/:chatID')
        .get(chatMiddleware.one(), chatController.chat)
        .delete(chatMiddleware.erase(), chatController.delete_chat)
        .patch(chatMiddleware.update(), chatController.update_chat)

    messageRoute(app)
}