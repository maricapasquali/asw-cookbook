import Rooms from "../rooms";
import {checkAuthorization as isAuthorized, userInformation} from "../rooms/user"
import {
    pushInOpenedChat,
    popFromOpenedChat,
    findUsersInOpenedChat,
    ChatRoomUser,
    changeUserRoleInChat,
    isInChat
} from "../rooms/chat"

export default function (io: any, socket: any): void {
    const user: ChatRoomUser = socket.handshake.auth.userinfo || { _id: null, userID: 'Anonymous' }

    type ChatInfo = { _id: string, info: { name?: string, type: string , usersRole: any[] }, users: any[] }
    const roomName = ( chat: ChatInfo ): string => {
        let room: string = '';
        switch (chat.info.type){
            case "one": room = Rooms.CHAT_ONE + '-' + chat.users.map(u => u._id).join('-'); break;
            case "group" : room = Rooms.CHAT_GROUP + '-' + chat.info.name + '-' + chat.users.map(u => u._id).join('-'); break;
        }
        return room
    }
    // REAL TIME SIGNED/ADMIN USER
    const enterOrLeaveChat = ( mode: 'enter' | 'leave', chat: ChatInfo) => {
        if(isAuthorized(socket) && user._id !== null && chat.users.find(u => u._id === user._id)){
            console.log(" -------------- " + mode + "-chat -------------- ")
            let room: string = roomName(chat)
            switch (mode){
                case "enter": {
                    socket.join(room);
                    pushInOpenedChat(room, chat.users, { _id: chat._id, name: chat.info.name, type: chat.info.type, usersRole: chat.info.usersRole })
                }
                break;
                case "leave": {
                    socket.leave(room);
                    popFromOpenedChat(io, room)
                }
                break;
            }
            io.in(room).emit(mode, {chatName: room, enteredUser: user._id})
            console.log(user.userID + ' ' + mode + ' room ' + room)
        }
    }

    socket.on('chat:enter', chat => enterOrLeaveChat('enter', chat))
    socket.on('chat:leave', chat => {
        if(isInChat(roomName(chat), io, socket.id)) enterOrLeaveChat('leave', chat)
    })

    socket.on('chat:change:role', (chatID: string, userRole: {user: string, role: string}) => {
        if(isAuthorized(socket)){
            let isChanged = changeUserRoleInChat(chatID, userRole)
            if(isChanged) socket.emit('chat:change:role:ok', chatID, userRole)
        }
    })

    socket.on('chat:messages', (room: string, messages: any[] | any): void => {
        if(isAuthorized(socket)){
            const _messages = Array.isArray(messages) ? messages: [messages]
            socket.to(room).emit('messages', _messages)


            const chat = findUsersInOpenedChat(room, _messages.map(u => u.sender._id))
            if(chat.users) {
                console.log('--> Push messages to users = ', chat.users)
                socket.to(chat.users).emit('push-messages', [{ info: chat.chatInfo, messages: _messages}])
            }
        }
    })
    socket.on('chat:typing', (room: string, data: any): void => {
        if(isAuthorized(socket)) socket.to(room).emit('typing', data)
    })

    socket.on('chat:read', (room: string, messages: any[]): void => {
        if(isAuthorized(socket)) {
            socket.to(room).emit('read-messages', messages)

            const {chatInfo} = findUsersInOpenedChat(room, messages.map(u => u.sender._id))
            let readUser = userInformation(socket)
            if(readUser.id && chatInfo) {
                console.log('--> Read messages = ', messages)
                socket.to(readUser.id).emit('read-messages', [{ info: chatInfo, messages }])
            }
        }
    })
}
