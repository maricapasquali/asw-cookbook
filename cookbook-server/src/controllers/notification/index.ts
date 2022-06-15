import {
    Notification,
    User
} from "../../models"
import { Types } from "mongoose"
import {
    MongooseDuplicateError,
    MongooseValidationError
} from "../../libs/custom.errors"
import { INotification } from "../../models/schemas/notification"
import { DecodedTokenType } from "../../libs/jwt.token"
import { Pagination } from "../../libs/pagination"
import { ExtendedError } from "socket.io/dist/namespace"

function notificationUser(decodedToken: DecodedTokenType): any[] {
    return accessManager.isAdminUser(decodedToken) ? [decodedToken.role] : [decodedToken._id, Types.ObjectId(decodedToken._id)]
}

export function listNotification(req, res) {
    const { page, limit } = req.query
    const user = req.locals.user
    const filters = req.locals.filters

    Pagination.ofQueryDocument(
        Notification.find(filters)
            .where("user")
            .in(notificationUser(user))
            .sort({ timestamp: -1, _id: -1 }),
        page && limit ? { page: +page, limit: +limit } : undefined
    )
        .then(
            result => res.status(200).json(result),
            err => res.status(500).json({ code: err.code, description: err.message })
        )
}

export function updateNotification(req, res) {
    const { notificationID } = req.params
    const { read } = req.body
    const user = req.locals.user

    Notification.updateOne({ user: { $in: notificationUser(user) }, _id: notificationID }, { read })
        .then(result => {
            if (result.n === 0) return res.status(404).json({ description: "Notification is not found." })
            return res.status(200).json({ description: "Notification marked as " + (read ? "read." : "unread.") })
        },
        err => res.status(500).json({ code: err.code, description: err.message }))
}

export function deleteNotification(req, res) {
    const { notificationID } = req.params
    const user = req.locals.user

    Notification.deleteOne({ user: { $in: notificationUser(user) }, _id: notificationID })
        .then(result => {
            if (result.n === 0) return res.status(404).json({ description: "Notification is not found." })
            return res.status(200).json({ description: "Notification has been deleted." })
        },
        err => res.status(500).json({ code: err.code, description: err.message }))
}

export async function createNotification(document: INotification | any): Promise<INotification> {
    function createError(data: any): ExtendedError {
        const err: ExtendedError = new Error("Creation notification: something wrong.")
        err.data = data
        return err
    }

    const isAdmin: boolean = accessManager.isAdminUser({ role: document.user })
    if (!(isAdmin || Types.ObjectId.isValid(document.user))) return Promise.reject(createError({ code: 400, description: "User id is not valid." }))

    function newNotification(document: INotification | any): Promise<INotification> {
        return new Notification(document)
            .save()
            .then(
                result => Promise.resolve(result),
                err => {
                    if (MongooseValidationError.is(err)) return Promise.reject(createError({ code: 400, description: err.message }))
                    if (MongooseDuplicateError.is(err)) return Promise.reject(createError({ code: 409, description: "Notification has been already inserted" }))
                    return Promise.reject(createError({ code: 500, description: err.message }))
                }
            )
    }

    return isAdmin
        ? newNotification(document)
        : User
            .findOne()
            .where("_id")
            .equals(document.user)
            .then(user => {
                if (!user) return Promise.reject(createError({ code: 404, description: "User is not found." }))
                return newNotification(document)
            }, err => Promise.reject(createError({ code: 500, description: err.message })))
}
