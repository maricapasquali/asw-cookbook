import io, {Socket} from "socket.io-client";

type SocketAuthorization = { key: string, userinfo?: { _id: string, userID: string, isAdmin?: boolean }}

export default function installSocket(Vue) {
    let socket: Socket = io({ autoConnect: false, withCredentials: true })

    socket.on('disconnect', (reason) => {
        console.log('SOCKET disconnect. Reason: ', reason);
    })

    socket.on('connect', () => {
        console.log('SOCKET connect with ID ', socket.id)
    })

    socket.on('error', (e) => {
        console.error('Error socket ', e)
    })

    Vue.prototype.$socket = socket

    Vue.prototype.$socket.connectStart = function (socketAuthorization: SocketAuthorization){
        if(socket.connected) socket.disconnect()
        if(socket.disconnected) {
            socket.auth = socketAuthorization
            socket.connect()
        }
        console.log('Socket: set authentication data & connect ...')
    }


    console.log('Install plugin socket ...')
}
