import {findAdminSocketIDs, findConnectedUserBy} from "../users";
import {create_notification} from "../../controllers/notification";
import {Notification} from "../../models/schemas/notification";
import {RBAC} from "../../modules/rbac";
import Role = RBAC.Role;


export function response(socket: any, comment: any, response: any): void {
    const toUser = findConnectedUserBy('_id', comment.user && comment.user._id)

    let nameUserComment = (comment.user ? comment.user.userID : 'Anonimo')
    let nameUserResponse = (response.user ? response.user.userID: 'Anonimo')

    const otherInfo =  {
        recipe: comment.recipe,
        comment: {_id: comment._id, user: comment.user ? comment.user._id: undefined},
        response:{_id: response._id, user: response.user ? response.user._id: undefined},
    }

    if(response.user) {
        create_notification({
            user: response.user._id,
            type: Notification.Type.COMMENT,
            content: 'Hai risposto al commento di ' + nameUserComment,
            otherInfo: otherInfo
        })
        .then(notification => socket.emit('comment:response', {notification}), err => console.error(err))
    }

    if(comment.user){
        create_notification({
            user: comment.user._id,
            type: Notification.Type.COMMENT,
            content: nameUserResponse + ' ha risposto al tuo commento.',
            otherInfo: otherInfo
        })
        .then(notification => {
            if(toUser.info) socket.to(toUser.info.socketID).emit('comment:response', { notification, response: { data: response, comment: comment._id } })
        }, err => console.error(err))
    }

    socket.broadcast.except(toUser.info?.socketID).emit('comment:response', { response: { data: response, comment: comment._id } })
}

export function report(socket: any, comment: any, reporter?: {_id: string, userID: String}): void {
    const admins = findAdminSocketIDs()
    const reportedUser = findConnectedUserBy('_id', comment.user && comment.user._id)

    let nameReported = (comment.user ? comment.user.userID : 'Anonimo')
    let nameReporter = (reporter ? reporter.userID: 'Anonimo')

    const otherInfo = {
        recipe : {_id: comment.recipe._id, owner: comment.recipe.owner._id},
        comment: {_id: comment._id, owner: comment.user ? comment.user._id : undefined},
        reporter: reporter ? reporter._id : undefined,
        reported: comment.user ? comment.user._id: undefined,
    }

    if(reporter) {
        create_notification({
            user: reporter._id,
            type: Notification.Type.REPORT,
            content: 'Hai segnalato il commento di ' + nameReported,
            otherInfo
        }).then(notification => socket.emit('comment:report', notification), err => console.error(err))
    }

    if(comment.user){
        create_notification({
            user: comment.user._id,
            type: Notification.Type.REPORT,
            content: 'Il tuo commento è stato segnalato da '+ nameReporter,
            otherInfo
        }).then(notification => {
            if(reportedUser.info) socket.to(reportedUser.info.socketID).emit('comment:report', notification)
        }, err => console.error(err))
    }

    create_notification({
        user: Role.ADMIN,
        type: Notification.Type.REPORT,
        content: nameReporter + ' ha segnalato il commento di ' + nameReported,
        otherInfo
    }).then(notification => {
        if(admins.length) socket.to(admins).emit('comment:report', notification)
    }, err => console.error(err))

    socket.broadcast.except([...admins, reportedUser.info?.socketID]).emit('comment:report', comment._id)
}