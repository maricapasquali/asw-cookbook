import registerChatHandlers from './chat'
import registerNotificationHandlers from './notification'
import registerUpdateHandlers from './update'

import {Server} from 'socket.io'
import * as https from "https";
import * as http from "http";

import * as config from "../../env.config"
import {onConnect, onDisconnect} from "./rooms";

export default function (server: http.Server | https.Server): void {

    const io = new Server(server, {
        cors: {
          origin: config.client.origin
        }
    })

    io.on('connection', socket => {

        onConnect(io, socket)

        //NOTIFICATIONs
        registerNotificationHandlers(io, socket)

        //UPDATEs
        registerUpdateHandlers(io, socket)

        // CHATs
        registerChatHandlers(io, socket)

        // DISCONNECT
        socket.on('disconnect', (reason) => {
            console.log('Disconnected: reason ', reason)
            onDisconnect(io, socket)
        });

    })

}
