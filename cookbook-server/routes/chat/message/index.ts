import * as messageController from '../../../controllers/chat/message'

export default function(app) {

    app.route('/api/users/:id/chats/:chatID/messages')
       .post(messageController.send_message)
       .put(messageController.read_messages)
       .get(messageController.list_messages)

    app.route('/api/users/:id/chats/:chatID/messages/:messageID')
        .get(messageController.one_message)
        .put(messageController.change_content_message)
        .delete(messageController.delete_message)

}