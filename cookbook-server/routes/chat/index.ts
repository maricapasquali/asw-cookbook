import * as chatController from '../../controllers/chat'
import messageRoute from './message'

export default function(app) {

    app.route('/api/users/:id/chats')
        .all(chatController.uploadChatImage())
        .post(chatController.create_chat)
        .get(chatController.list_chat)

    app.route('/api/users/:id/chats/:chatID')
        .get(chatController.chat)
        .delete(chatController.delete_chat)
        .patch(chatController.update_chat)

    messageRoute(app)
}