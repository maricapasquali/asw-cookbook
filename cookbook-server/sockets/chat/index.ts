import Rooms from "../rooms";
import {userInformation} from "../rooms/user"
import {
    pushInOpenedChat,
    popFromOpenedChat,
    findUsersInOpenedChat,
    ChatRoomUser,
    changeUserRoleInChat,
    isInChat
} from "../rooms/chat"

export type TypingData = { _id: string, userID: string, typing: boolean }

export type ChatInfo = { _id: string, info: { name?: string, type: string , usersRole: any[] }, users: any[] }

export default function (io: any, socket: any): void {
    const user: ChatRoomUser = socket.handshake.auth.userinfo || { _id: null, userID: 'Anonymous' }

    const chatRoomName = (chat: ChatInfo): string => {
        let room: string = '';
        switch (chat.info.type){
            case "one": room = [Rooms.CHAT_ONE, chat.users.map(u => u._id).join('-')].join('-'); break;
            case "group" : room = [Rooms.CHAT_GROUP, [chat.info.name, chat.users.map(u => u._id).join('-')].join('-') ].join('-'); break;
        }
        return room
    }

    // REAL TIME SIGNED/ADMIN USER
    const enterOrLeaveChat = ( mode: 'enter' | 'leave', chat: ChatInfo) => {
        if (user._id !== null && chat.users.find(u => u._id == user._id)) {
            console.log(" -------------- " + mode + "-chat -------------- ")
            let room: string = chatRoomName(chat)
            switch (mode){
                case "enter": {
                    socket.join(room);
                    pushInOpenedChat(room, chat.users, { _id: chat._id, name: chat.info.name, type: chat.info.type, usersRole: chat.info.usersRole })
                }
                    break;
                case "leave": {
                    if(isInChat(room, io, socket.id)) {
                        socket.leave(room);
                        popFromOpenedChat(io, room)
                    }
                    else {
                        socket.emit("user:not-entered", user._id)
                        return
                    }
                }
                    break;
            }
            io.in(room).emit(mode, {chatName: room, enteredUser: user._id})
            console.log(user.userID + ' ' + mode + ' room ' + room)
        } else {
            socket.emit("user:not-found", user._id)
        }
    }

    socket.on('chat:enter', chat => enterOrLeaveChat('enter', chat))

    socket.on('chat:leave', chat => enterOrLeaveChat('leave', chat))

    socket.on('chat:change:role', (chatID: string, userRole: {user: string, role: string}) => {
        let isChanged = changeUserRoleInChat(chatID, userRole)
        if(isChanged) socket.emit('chat:change:role:ok', chatID, userRole)
        else socket.emit('chat:unchanged:role')
    })

    socket.on('chat:messages', (room: string, messages: any[] | any): void => {
        if(isInChat(room, io, socket.id)) {
            const _messages = Array.isArray(messages) ? messages: [messages]
            socket.to(room).emit('messages', _messages)


            const chat = findUsersInOpenedChat(room, _messages.map(u => u.sender._id))
            if(chat.users) {
                console.log('--> Push messages to users = ', chat.users)
                socket.to(chat.users).emit('push-messages', [{ info: chat.chatInfo, messages: _messages}])
            }
        } else socket.emit("user:not-entered", user._id)
    })

    socket.on('chat:typing', (room: string, data: TypingData): void => {
        if(isInChat(room, io, socket.id)) socket.to(room).emit('typing', data)
        else socket.emit("user:not-entered", user._id)
    })

    socket.on('chat:read', (room: string, messages: any[]): void => {
        if(isInChat(room, io, socket.id)) {
                socket.to(room).emit('read-messages', messages)

                const {chatInfo} = findUsersInOpenedChat(room, messages.map(u => u.sender._id))
                let readUser = userInformation(socket)
                if(readUser.id && chatInfo) {
                    console.log('--> Read messages = ', messages)
                    socket.to(readUser.id).emit('read-messages', [{ info: chatInfo, messages }])
                }
            } else socket.emit("user:not-entered", user._id)
    })
}
