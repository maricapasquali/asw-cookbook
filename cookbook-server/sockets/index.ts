import registerUserHandlers, {findConnectedUserBy, popConnectedUser, pushIfIsAbsentConnectedUser} from './user'
import registerChatHandlers, {popIfInChatRoom} from './chat'
import registerNotificationHandlers from './notification'

import {client_origin} from "../../modules/hosting/variables";
import {Server} from 'socket.io'
import * as https from "https";
import * as http from "http";

export = function (server: http.Server | https.Server): void {

    const io = new Server(server, {
        cors: {
          origin: client_origin
        }
    })

    io.on('connection', socket => {

        const username = (socket.handshake.auth.userinfo ? socket.handshake.auth.userinfo.userID: 'Anonymous')
        console.log(username + ' is connected');
        pushIfIsAbsentConnectedUser(io, socket)
        if(socket.handshake.auth.key) console.debug(username + ' has token = ', socket.handshake.auth.key);

        // CHECK SOMETHING ABOUT USERS
        registerUserHandlers(io, socket)

        // CHATs
        registerChatHandlers(io, socket)

        //NOTIFICATIONs
        registerNotificationHandlers(io, socket)

        // DISCONNECT
        socket.on('disconnect', (reason) => {
            console.log('Disconnected: reason ', reason)
            let userBy = findConnectedUserBy('auth', socket.handshake.auth.key)
            let _id: string
            if(userBy.info) {
                _id = userBy.info.user._id
                popConnectedUser(io, '_id', _id)
            }
            console.log(username +' is disconnected');
            popIfInChatRoom(io, _id)
        });

    })

}