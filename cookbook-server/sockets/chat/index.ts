import Rooms from "../rooms";
import * as _ from 'lodash'
import {findConnectedUserBy, checkAuthorization as isAuthorized} from "../users";

type ChatRoomUser = { _id: string | null,  userID: string | 'Anonymous', isAdmin?: boolean }
type ChatExtraInfo = { _id: string, name?: string, type: string, usersRole: any[] }
type Chat = { name: string, availableUsers: ChatRoomUser[], extra: ChatExtraInfo }

const openedChats: Chat[] = []

function pushInOpenedChat(chatName: string, availableUsers: ChatRoomUser[], extrasInfo: ChatExtraInfo){
    const _chat = { name: chatName, availableUsers , extra: extrasInfo }
    const noOpened: boolean = _.findIndex(openedChats, _chat) === -1
    console.log('Chat ', JSON.stringify(_chat), ' is open = ', !noOpened)
    if(noOpened) openedChats.push(_chat)
}
function findSocketIdsInOpenedChat(chatName: string): {sockets?: string[] , chatInfo?: any} {
    const chat = openedChats.find(chat => chat.name === chatName)
    if(!chat) return {}
    return {
        sockets: chat.availableUsers
                     .map(u => findConnectedUserBy('_id', u._id).info)
                     .filter(u => typeof u !== 'undefined')
                     .map(u => u.socketID),
        chatInfo: chat.extra
    }
}
function popFromOpenedChat(io: any, chatName: string){
    const roomSockets = io.sockets.adapter.rooms.get(chatName)
    console.debug('Room sockets = ', roomSockets)
    if(!roomSockets){
        const index = openedChats.findIndex(chat => chat.name == chatName)
        if(index !== -1) {
            console.log('remove opened chat ', chatName)
            openedChats.splice(index, 1)
        }
    }
    console.log('Opened chats ', openedChats)
}

export default function (io: any, socket: any): void {
    const user: ChatRoomUser = socket.handshake.auth.userinfo || { _id: null, userID: 'Anonymous' }

    // REAL TIME SIGNED/ADMIN USER
    const enterOrLeaveChat = ( mode: 'enter' | 'leave', chat: { _id: string, info: { name?: string, type: string , usersRole: any[] }, users: any[] }) => {
        if(isAuthorized(socket) && user._id !== null && chat.users.find(u => u._id === user._id)){
            console.log(" -------------- " + mode + "-chat -------------- ")
            let room: string = '';
            switch (chat.info.type){
                case "one": room = Rooms.CHAT_ONE + '-' + chat.users.map(u => u._id).join('-'); break;
                case "group" : room = Rooms.CHAT_GROUP + '-' + chat.info.name + '-' + chat.users.map(u => u._id).join('-'); break;
            }
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
    socket.on('chat:leave', chat => enterOrLeaveChat('leave', chat))

    socket.on('chat:change:role', (chatID: string, userRole: {user: string, role: string}) => {
        if(isAuthorized(socket)){
            const openChat = openedChats.find(chat => chat.extra._id === chatID)
            if(openChat){
                const index = openChat.extra.usersRole.findIndex(r => r.user === userRole.user)
                if(index !== -1) {
                    openChat.extra.usersRole.splice(index, 1, userRole)
                    console.debug(`chat ${chatID} => new users role = `, openChat.extra.usersRole)
                    socket.emit('chat:change:role:ok', chatID, userRole)
                }
            }
        }
    })

    socket.on('chat:messages', (room: string, messages: any[] | any): void => {
        if(isAuthorized(socket)){
            const _messages = Array.isArray(messages) ? messages: [messages]
            socket.to(room).emit('messages', _messages)


            const chat = findSocketIdsInOpenedChat(room)
            if(chat.sockets && chat.sockets.length) {
                console.log('-------> Push messages to sockets = ', chat.sockets)
                socket.to(chat.sockets).emit('push-messages', [{ info: chat.chatInfo, messages: _messages}])
            }
        }
    })
    socket.on('chat:typing', (room: string, data: any): void => {
        if(isAuthorized(socket)) socket.to(room).emit('typing', data)
    })
    socket.on('chat:read', (room: string, messages: any[]): void => {
        if(isAuthorized(socket)) socket.to(room).emit('read-messages', messages)
    })
}