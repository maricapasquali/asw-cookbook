import registerChatHandlers from './chat'
import registerNotificationHandlers from './notification'
import registerUpdateHandlers from './update'
import registerSessionHandlers from './session'

import {Server} from 'socket.io'
import {onConnect, onDisconnect} from "./rooms";
import {middlewareCheckAuthorization, middlewareCheckNoAnonymous} from "./rooms/user";
import {ExtendedError} from "socket.io/dist/namespace";

export default function (io: Server): void {

    io.use(middlewareCheckAuthorization)
      .on('connection', socket => {

          socket.use(([event, value], next) => {
              let checkIfAuthenticationIsValid = /chat:.*|friendship:.*|recipe:(?!comment$).*|user:update:password|user:strike|food:create|logout/.test(event)
              console.debug(`Check auth on event '${event}' = ${checkIfAuthenticationIsValid}.`)
              if(checkIfAuthenticationIsValid) middlewareCheckNoAnonymous(socket, next)
              else next()
          })

          onConnect(io, socket)

          //NOTIFICATIONs
          registerNotificationHandlers(io, socket)

          //UPDATEs
          registerUpdateHandlers(io, socket)

          // CHATs
          registerChatHandlers(io, socket)

          // SESSION (logout)
          registerSessionHandlers(io, socket)

          // DISCONNECT
          socket.on('disconnect', (reason) => {
              console.log('Disconnected: reason ', reason)
              onDisconnect(io, socket)
          });

          // ERRORS
          socket.on("error", (error: ExtendedError) => {
              console.debug("Handler errors on socket....")
              socket.emit('operation:not:authorized', { message: error.message, expired: error.data.expired })
          })
      })

}
