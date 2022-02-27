import {openedChatsRoom, popFromOpenedChat} from "../rooms/chat";
import {userInformation} from "../rooms/user";

export default function (io: any, socket: any): void {

    socket.on('logout', () => {
        let userInfo = userInformation(socket)
        // Leave chat rooms
        openedChatsRoom(io)
            .filter(chatName => io.sockets.adapter.rooms.get(chatName).has(socket.id))
            .forEach(chatName => {
                socket.leave(chatName)
                popFromOpenedChat(io, chatName)
            })
        io.to(userInfo.id).emit('logout')
    })

}
