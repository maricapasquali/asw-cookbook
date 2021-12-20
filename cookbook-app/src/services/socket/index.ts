import io from "socket.io-client";
import {domain_server} from "../../../../modules/hosting/variables";

const serverURI = process.env.VUE_APP_SERVER || domain_server

const socket = io(serverURI , {
    autoConnect: false
})

type SocketAuthorization = { key: string, userinfo?: { _id: string, userID: string, isAdmin?: boolean }}
export function setSocket(socketAuthorization: SocketAuthorization): void {
    socket.disconnect()
    if(socket.disconnected) {
        socket.auth = socketAuthorization
        socket.connect()
    }
    console.log(socket)
}
socket.on('disconnect', (reason) => {
    console.log('disconnect socket: ', reason);
})
socket.on('connect', () => {
    console.log('connect socket: ', socket.id)
})

export default socket