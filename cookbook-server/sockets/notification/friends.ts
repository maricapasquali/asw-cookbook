import {create_notification} from "../../controllers/notification";
import {Notification} from "../../models/schemas/notification";
import {FriendShip, IFriend} from "../../models/schemas/user/friend";
import {UserInformationType} from "../rooms/user";

export function request(io: any, request: IFriend): void {
    console.log('Request = ', request)

    create_notification({
        user: request.from._id,
        type: Notification.Type.FRIENDSHIP,
        content: 'Hai richiesto l\'amicizia a ' + request.to.userID,
        otherInfo: {
            to: request.to._id
        }
    })
    .then(notification => io.to(request.from._id).emit('friendship:request', notification), err => console.error(err))

    create_notification({
        user: request.to._id,
        type: Notification.Type.FRIENDSHIP,
        content: request.from.userID + ' vuole essere tuo amico.',
        otherInfo: {
            from: request.from._id
        }
    })
    .then(notification => io.to(request.to._id).emit('friendship:request', notification), err => console.error(err))

}

export function update(io: any, request: IFriend): void {
    console.log('Request update = ', request)

    let friendship = request

    create_notification({
        user: request.to._id,
        type: Notification.Type.FRIENDSHIP,
        content: 'Hai ' + (request.state===FriendShip.State.ACCEPTED ? 'accettato': 'rifiutato') + ' la richiesta di amicizia di '+ request.from.userID ,
        otherInfo: {
            from: request.from._id,
            state: request.state
        }
    })
    .then(notification => io.to(request.to._id).emit('friendship:update', {notification, friendship}), err => console.error(err))

    create_notification({
        user: request.from._id,
        type: Notification.Type.FRIENDSHIP,
        content: request.to.userID + ' ha ' + (request.state===FriendShip.State.ACCEPTED ? 'accettato': 'rifiutato') + ' la tua richiesta.',
        otherInfo: {
            to: request.to._id,
            state: request.state
        }
    })
    .then(notification => io.to(request.from._id).emit('friendship:update', {notification, friendship}), err => console.error(err))

    if(request.state == FriendShip.State.ACCEPTED) io.local.except([request.from._id, request.to._id]).emit('friendship:update', { friendship })
}

export function remove(io: any, user: UserInformationType, otherUser: { _id: string, userID: string }): void {
    let friendship = { from: { _id: user.id }, to: { _id: otherUser._id } }
    console.log('I (id: '+user.id+', name: '+user.name+') remove friend = (id: '+otherUser._id+', name: '+otherUser.userID+') ')

    create_notification({
        user: user.id,
        type: Notification.Type.FRIENDSHIP,
        content: 'Hai smesso di seguire ' + otherUser.userID,
        otherInfo: {
            exFriend: otherUser._id
        }
    })
    .then(notification => io.to(user.id).emit('friendship:remove', {notification, friendship}), err => console.error(err))

    create_notification({
        user: otherUser._id,
        type: Notification.Type.FRIENDSHIP,
        content: user.name + ' ha smesso di seguirti.',
        otherInfo: {
            exFriend: user.id
        }
    })
    .then(notification => io.to(otherUser._id).emit('friendship:remove', {notification, friendship}), err => console.error(err))

    io.local.except([user.id, otherUser._id]).emit('friendship:remove', {friendship})
}
