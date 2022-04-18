import {messageController} from '../../../controllers'
import {messageMiddleware} from '../../../middlewares'

export default function(app) {

    app.route('/api/users/:id/chats/:chatID/messages')
       .post(messageMiddleware.send(), messageController.send_message)
       .put(messageMiddleware.read_messages(), messageController.read_messages)
       .get(messageMiddleware.list(), messageController.list_messages)

    app.route('/api/users/:id/chats/:chatID/messages/:messageID')
        .get(messageController.one_message)
        .put(messageController.change_content_message)
        .delete(messageController.delete_message)

}