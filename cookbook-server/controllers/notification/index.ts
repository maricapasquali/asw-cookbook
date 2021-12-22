import {Notification, User} from "../../models";
import {getRestrictedUser, pagination} from "../index";
import {RBAC} from "../../modules/rbac";
import {Types} from "mongoose";
import {MongooseDuplicateError, MongooseValidationError} from "../../modules/custom.errors";
import {INotification} from "../../models/schemas/notification";
import Subject = RBAC.Subject;
import Operation = RBAC.Operation;

export function list_notification(req, res){
    let {id} = req.params
    if(!Types.ObjectId.isValid(id)) return res.status(400).json({ description: 'Required a valid \'id\''})
    let {readed, page, limit} = req.query
    if(readed){
        try {
            readed = JSON.parse(readed)
            if(typeof readed !== 'boolean') throw new Error()
        } catch (e){
            return res.status(400).json('Query \'readed\' must be a boolean')
        }
    }
    const user = getRestrictedUser(req, res, {
        operation: Operation.RETRIEVE,
        subject: Subject.NOTIFICATION,
        others: (decodedToken => decodedToken._id !== id)
    })
    if(user){
        const filters = typeof readed === 'boolean' ? { read: readed }: {}
        pagination(
            Notification.find(filters).where('user').where(id),
            page && limit ? { page: +page, limit: +limit } : undefined
        ).then(result => res.status(200).json(result),
               err => res.status(500).json({code: err.code, description: err.message}))
    }
}

export function update_notification(req, res){
    let { id, notificationID } = req.params
    if(!Types.ObjectId.isValid(id)) return res.status(400).json({ description: 'Required a valid \'id\''})
    if(!Types.ObjectId.isValid(notificationID)) return res.status(400).json({ description: 'Required a valid \'notificationID\''})
    let { read } = req.body
    if(typeof read !== 'boolean') return res.status(400).json({ description: 'Body required field \'read: boolean\' '})

    const user = getRestrictedUser(req, res, {
        operation: Operation.UPDATE,
        subject: Subject.NOTIFICATION,
        others: (decodedToken => decodedToken._id !== id)
    })
    if(user){
        Notification.updateOne({ user: id, _id: notificationID }, { read: read })
                    .then(result => {
                        if(result.n === 0) return res.status(404).json({ description: 'Notification is not found.' })
                        return res.status(200).json({ description: 'Notification marked as ' + (read ? 'read.': 'unread.') })
                    },
                    err => res.status(500).json({code: err.code, description: err.message}))
    }
}

export function delete_notification(req, res){
    let { id, notificationID } = req.params
    if(!Types.ObjectId.isValid(id)) return res.status(400).json({ description: 'Required a valid \'id\''})
    if(!Types.ObjectId.isValid(notificationID)) return res.status(400).json({ description: 'Required a valid \'notificationID\''})

    const user = getRestrictedUser(req, res, {
        operation: Operation.DELETE,
        subject: Subject.NOTIFICATION,
        others: (decodedToken => decodedToken._id !== id)
    })
    if(user){
        Notification.deleteOne({ user: id, _id: notificationID })
                    .then(result => {
                        if(result.n === 0) return res.status(404).json({ description: 'Notification is not found.' })
                        return res.status(200).json({description: 'Notification has been deleted.'})
                    },
                    err => res.status(500).json({code: err.code, description: err.message}))
    }
}

export async function create_notification(document: INotification): Promise<INotification> {
   if(!Types.ObjectId.isValid(document.user)) return Promise.reject({ code: 400, description: 'User id is not valid.' })
   return User.findOne()
              .where('_id').equals(document.user)
              .then(user => {
                  if(!user) return Promise.reject({ code: 404, description: 'User is not found.' })
                  return new Notification(document)
                              .save()
                              .then(result => Promise.resolve(result) ,
                                    err => {
                                        if(MongooseValidationError.is(err)) return Promise.reject({ code: 400, description: err.message })
                                        if(MongooseDuplicateError.is(err)) return Promise.reject({ code: 409, description: 'Notification has been already inserted' })
                                        return Promise.reject({ code: 500, description: err.message })
                                    }
                              )
              }, err => Promise.reject({ code: 500, description: err.message }))
}