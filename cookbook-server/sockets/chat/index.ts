import Rooms from "../rooms";

type ChatRoomUser = { _id: string | null,  userID: string | 'Anonymous', isAdmin?: boolean }

const chatRoomsUsers: ChatRoomUser[] = []

export function pushInChatRoom(io: any, user: ChatRoomUser){
    let _index = chatRoomsUsers.findIndex(u => u._id === user._id)

    if(_index === -1) chatRoomsUsers.push(user)
    io.in(Rooms.CHAT_ROOM).emit('enter', chatRoomsUsers)
    console.log('Chat Room: join . => ', chatRoomsUsers)
}

export function popIfInChatRoom(io: any, _id?: string){
    let _index = chatRoomsUsers.findIndex(u => u._id == _id)

    if(_index !== -1) chatRoomsUsers.splice(_index, 1)
    io.in(Rooms.CHAT_ROOM).emit('leave',  chatRoomsUsers)
    console.log('Chat Room: leave . => ', chatRoomsUsers)
}

export default function (io: any, socket: any): void {
    let user: ChatRoomUser = socket.handshake.auth.userinfo || { _id: null, userID: 'Anonymous' }

    // REAL TIME ALL USER ALSO ANONYMOUS AND ADMIN
    socket.on('chat:enter', (data) => {
        socket.join(Rooms.CHAT_ROOM)
        console.log('Enter ', user)
        pushInChatRoom(io, user)
    })

    socket.on('chat:leave', (data) => {
        socket.leave(Rooms.CHAT_ROOM)
        console.log('Leave ', user)
        popIfInChatRoom(io, user._id)
    })

    socket.on('chat:message', (data) => {
        console.log('/chats: message = ', data)
        socket.to(Rooms.CHAT_ROOM).emit('message', data)
    })

    socket.on('chat:typing', (data) => {
        console.log('/chats: typing = ', data)
        socket.to(Rooms.CHAT_ROOM).emit('typing', data)
    })

}