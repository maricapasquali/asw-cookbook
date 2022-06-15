import io, { Socket } from "socket.io-client"

type SocketAuthorization = { key: string, userinfo?: { _id: string, userID: string, isAdmin?: boolean } }

declare module "socket.io-client" {
    interface Socket {
        /**
         * Updates the authorization information on the socket and reconnects it.
         * @param socketAuthorization new authorization information
         */
        updateAuthorization: (socketAuthorization: SocketAuthorization) => void
    }
}

Socket.prototype.updateAuthorization = function (socketAuthorization: SocketAuthorization){
    this.auth = socketAuthorization
    this.disconnect().connect()
    console.debug("Socket: set authentication data & connect ...")
}

export const socketIO: Socket = io({
    autoConnect: false,
    withCredentials: true
})

socketIO.on("connect", () => {
    console.debug("SOCKET connect with ID ", socketIO.id)
})

socketIO.on("disconnect", reason => {
    console.debug("SOCKET disconnect. Reason: ", reason)
})

socketIO.on("connect_error", e => {
    console.error("SOCKET connection error: ", e)
})
