import {badRequest, forbidden, notFound, serverError, unAuthenticated} from "../handler-common-error";

function similarErrorHandler(err: any): void {
    switch (err.response?.status) {
        case 400:
            badRequest(err)
            return
        case 401:
            unAuthenticated(err, {_forbiddenPage: true})
            return
        case 403:
            forbidden(err)
            return
        case 404:
            if(err.response?.config?.urlParams?.notificationID)
                return notFound(err, {name: 'Notifica', id: err.response?.config?.urlParams?.notificationID})
    }
    serverError(err)
}

export const getNotifications = similarErrorHandler

export const updateNotification = similarErrorHandler

export const deleteNotification =similarErrorHandler
