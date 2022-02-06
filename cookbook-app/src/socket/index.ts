import io, {Socket} from "socket.io-client";

import {domain_server} from "../../../modules/hosting/variables";

type SocketAuthorization = { key: string, userinfo?: { _id: string, userID: string, isAdmin?: boolean }}

const serverURI = process.env.VUE_APP_SERVER || domain_server

export const socket: Socket = io(serverURI , {
    autoConnect: false
})

export default function installSocket(Vue, options) {
    Vue.prototype.$socket = socket

    socket.on('disconnect', (reason) => {
        console.log('SOCKET disconnect. Reason: ', reason);
    })

    socket.on('connect', () => {
        console.log('SOCKET connect with ID ', socket.id)
    })

    socket.on('error', (e) => {
        console.error('Error socket ', e)
    })

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