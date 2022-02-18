import {findConnectedUserBy, popConnectedUser, pushIfIsAbsentConnectedUser} from './users'
import registerChatHandlers from './chat'
import registerNotificationHandlers from './notification'
import registerUpdateHandlers from './update'

import {Server} from 'socket.io'
import * as https from "https";
import * as http from "http";

import * as config from "../../env.config"

export default function (server: http.Server | https.Server): void {

    const io = new Server(server, {
        cors: {
          origin: config.client.origin
        }
    })

    io.on('connection', socket => {

        const username = (socket.handshake.auth.userinfo?.userID || 'Anonymous')
        console.log(username + ' is connected');
        pushIfIsAbsentConnectedUser(io, socket)

        //NOTIFICATIONs
        registerNotificationHandlers(io, socket)

        //UPDATEs
        registerUpdateHandlers(io, socket)

        // CHATs
        registerChatHandlers(io, socket)

        // DISCONNECT
        socket.on('disconnect', (reason) => {
            console.log('Disconnected: reason ', reason)
            let userBy = findConnectedUserBy('auth', socket.handshake.auth.key)
            let _id: string
            if(userBy.info && userBy.info.user) {
                _id = userBy.info.user._id
                popConnectedUser(io, '_id', _id)
            }
            else popConnectedUser(io, 'socketID', socket.id)
            console.log(username +' is disconnected');
        });

    })

}