import * as methods from "../methods";
import  {AxiosResponse} from "axios";
import * as handlerError from './handlerError'

export const HandlerError = handlerError

export function getNotifications(user: string, token: string, query?: {readed?: boolean}, paginationOptions?: {page: number, limit: number}): Promise<AxiosResponse> {
    return methods.get('/users/:id/notifications', {
        headers: {
            authorization: 'Bearer ' + token
        },
        params: {
          ...query,
          ...paginationOptions
        },
        urlParams: {
            id: user
        }
    })
}

export function updateNotification(user: string, notification: string, body: { read: boolean }, token: string): Promise<AxiosResponse> {
    return methods.patch('/users/:id/notifications/:notificationID',  body, {
        headers: {
            authorization: 'Bearer ' + token
        },
        urlParams: {
            id: user,
            notificationID: notification
        }
    })
}

export function deleteNotification(user: string, notification: string, token: string ): Promise<AxiosResponse> {
    return methods.erase('/users/:id/notifications/:notificationID', {
        headers: {
            authorization: 'Bearer ' + token
        },
        urlParams: {
            id: user,
            notificationID: notification
        }
    })
}