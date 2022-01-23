import {create_notification} from "../../controllers/notification";
import {Notification} from "../../models/schemas/notification";
import {findAdminSocketIDs, findConnectedUserBy} from "../user";
import {Strike} from "../../models/schemas/user";
import {User} from "../../models";

export function password(socket: any): void {
    const user = findConnectedUserBy('socketID', socket.id)
    if(user.info) {
        console.log('Update password => User :', user.info.user)
        create_notification({
            user: user.info.user._id,
            type: Notification.Type.USER_INFO,
            content: 'La tua password è stata cambiata.'
        })
        .then(notification => socket.emit('user:update:password', notification),
              err => console.error(err))
    }
}


export function strike(socket: any, id: string): void {
    if(findAdminSocketIDs().includes(socket.id)) {
        User.findOne()
            .where('_id').equals(id)
            .then(user =>{
                if(user) {
                    create_notification({
                        user: user._id,
                        type: Notification.Type.STRIKE,
                        content: 'Attenzione!! Hai già effettuato ' + user.strike + ' strike. ' +
                                 'Se raggiungi ' + Strike.MAX + ' strike, il tuo account verrà bloccato automaticamente.' ,
                        otherInfo: {
                            strike: user.strike,
                            maxStrike: Strike.MAX
                        }
                    })
                    .then(notification => {
                        const connectedUser = findConnectedUserBy('_id', user._id)
                        if(connectedUser.info) socket.to(connectedUser.info.socketID).emit('user:strike', { notification, strike: user.strike} )
                    }, err => console.error(err))
                }
                else console.error('user is not found')
            }, err => console.error(err))
    }
}