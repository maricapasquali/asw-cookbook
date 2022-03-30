import io, {Socket} from "socket.io-client";

type SocketAuthorization = { key: string, userinfo?: { _id: string, userID: string, isAdmin?: boolean } }

declare module 'socket.io-client' {
    interface Socket {
        updateAuthorization(socketAuthorization: SocketAuthorization): void
    }
}

Socket.prototype.updateAuthorization = function (socketAuthorization: SocketAuthorization){
    this.auth = socketAuthorization
    this.disconnect().connect()
    console.log('Socket: set authentication data & connect ...')
}

const socketIO: Socket = io({
    autoConnect: false,
    withCredentials: true
})

socketIO.on('connect', () => {
    console.log('SOCKET connect with ID ', socketIO.id)
})

socketIO.on('disconnect', (reason) => {
    console.log('SOCKET disconnect. Reason: ', reason);
})

socketIO.on('error', (e) => {
    console.error('Error socket ', e)
})

export default {
    socketIO
}
