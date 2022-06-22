import { createNotification } from "../../controllers/notification"
import { Notification } from "../../models/schemas/notification"
import { RBAC } from "../../libs/rbac"
import Rooms from "../rooms"
import Role = RBAC.Role

export function response(io: any, comment: any, response: any): void {
    const fromUser = response.user?._id
    const toUser = comment.user?._id
    const _response = { response: { data: response, comment: comment._id } }

    const nameUserComment = comment.user?.userID || "Anonimo"
    const nameUserResponse = response.user?.userID || "Anonimo"

    const otherInfo = {
        recipe: comment.recipe,
        comment: { _id: comment._id, user: comment.user?._id },
        response: { _id: response._id, user: response.user?._id }
    }

    if (response.user) {
        createNotification({
            user: fromUser,
            type: Notification.Type.COMMENT,
            content: "Hai risposto al commento di " + nameUserComment,
            otherInfo
        })
            .then(notification => io.to(fromUser)
                .emit("comment:response", { notification, ..._response }), err => console.error(err))
    }

    if (comment.user) {
        createNotification({
            user: toUser,
            type: Notification.Type.COMMENT,
            content: nameUserResponse + " ha risposto al tuo commento.",
            otherInfo
        })
            .then(notification => io.to(toUser)
                .emit("comment:response", { notification, ..._response }), err => console.error(err))
    }

    io.local.except([toUser, fromUser])
        .emit("comment:response", { ..._response })
}

export function report(io: any, comment: any, reporter?: {_id: string, userID: string}): void {
    const reportedUser = comment.user?._id

    const nameReported = (comment.user ? comment.user.userID : "Anonimo")
    const nameReporter = (reporter ? reporter.userID : "Anonimo")

    const otherInfo = {
        recipe: { _id: comment.recipe._id, owner: comment.recipe.owner?._id },
        comment: { _id: comment._id, owner: comment.user?._id },
        reporter: reporter?._id,
        reported: comment.user?._id
    }

    if (reporter) {
        createNotification({
            user: reporter._id,
            type: Notification.Type.REPORT,
            content: "Hai segnalato il commento di " + nameReported,
            otherInfo
        })
            .then(notification => io.to(reporter._id)
                .emit("comment:report", notification), err => console.error(err))
    }

    if (comment.user) {
        createNotification({
            user: reportedUser,
            type: Notification.Type.REPORT,
            content: "Il tuo commento è stato segnalato da " + nameReporter,
            otherInfo
        })
            .then(notification => io.to(reportedUser)
                .emit("comment:report", notification), err => console.error(err))
    }

    createNotification({
        user: Role.ADMIN,
        type: Notification.Type.REPORT,
        content: nameReporter + " ha segnalato il commento di " + nameReported,
        otherInfo
    })
        .then(notification => io.to(Rooms.ADMINS)
            .emit("comment:report", notification), err => console.error(err))

    io.local.except([Rooms.ADMINS, reportedUser, reporter?._id])
        .emit("comment:report", comment._id)
}
