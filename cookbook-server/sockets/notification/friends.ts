import {findConnectedUserBy, getSocketIDs} from "../user";
import {create_notification} from "../../controllers/notification";
import {Notification} from "../../models/schemas/notification";
import {FriendShip, IFriend} from "../../models/schemas/user/friend";

export function request(socket: any, request: IFriend): void {
    console.log('Request = ', request)

    create_notification({
        user: request.from._id,
        type: Notification.Type.FRIENDSHIP,
        content: 'Hai richiesto l\'amicizia a ' + request.to.userID,
        otherInfo: {
            to: request.to._id
        }
    })
    .then(notification => socket.emit('friendship:request', notification), err => console.error(err))

    create_notification({
        user: request.to._id,
        type: Notification.Type.FRIENDSHIP,
        content: request.from.userID + ' vuole essere tuo amico.',
        otherInfo: {
            from: request.from._id
        }
    })
    .then(notification => {
        let user = findConnectedUserBy('_id', request.to._id)
        if(user.info) socket.to(user.info.socketID).emit('friendship:request', notification)
    }, err => console.error(err))

}

export function update(socket: any, request: IFriend): void {
    console.log('Request update = ', request)
    let user = findConnectedUserBy('_id', request.from._id)

    create_notification({
        user: request.to._id,
        type: Notification.Type.FRIENDSHIP,
        content: 'Hai ' + (request.state===FriendShip.State.ACCEPTED ? 'accettato': 'rifiutato') + ' la richiesta di amicizia di '+ request.from.userID ,
        otherInfo: {
            from: request.from._id,
            state: request.state
        }
    })
    .then(notification => socket.emit('friendship:update', {notification}), err => console.error(err))

    create_notification({
        user: request.from._id,
        type: Notification.Type.FRIENDSHIP,
        content: request.to.userID + ' ha ' + (request.state===FriendShip.State.ACCEPTED ? 'accettato': 'rifiutato') + ' la tua richiesta.',
        otherInfo: {
            to: request.to._id,
            state: request.state
        }
    })
    .then(notification => {
        if(user.info) socket.to(user.info.socketID).emit('friendship:update', {notification})
    }, err => console.error(err))

    if(request.state == FriendShip.State.ACCEPTED) {
        const otherFriends = getSocketIDs()
        if(otherFriends.length) socket.to(otherFriends).emit('friendship:update', {friendship: request})
    }
}

export function remove(socket: any, otherUser: { _id: string, userID: string }): void {
    let fromUser = findConnectedUserBy('socketID', socket.id)
    let toUser = findConnectedUserBy('_id', otherUser._id)
    console.log('Remove friend = ', JSON.stringify(otherUser))

    create_notification({
        user: fromUser.info.user._id,
        type: Notification.Type.FRIENDSHIP,
        content: 'Hai smesso di seguire ' + otherUser.userID,
        otherInfo: {
            exFriend: otherUser._id
        }
    })
    .then(notification => socket.emit('friendship:remove', {notification}), err => console.error(err))

    create_notification({
        user: otherUser._id,
        type: Notification.Type.FRIENDSHIP,
        content: fromUser.info.user.userID + ' ha smesso di seguirti.',
        otherInfo: {
            exFriend: fromUser.info.user._id
        }
    })
    .then(notification => {
        if(toUser.info) socket.to(toUser.info.socketID).emit('friendship:remove', {notification})
    }, err => console.error(err))

    const otherFriends = getSocketIDs()
    if(otherFriends.length) {
        let friendship = { from: { _id: fromUser.info.user._id }, to: { _id: otherUser._id } }
        socket.to(otherFriends).emit('friendship:remove', {friendship})
    }
}

