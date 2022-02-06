import handlerErrorBase from './base'
export default function (bus){
    const {badRequest, forbidden, notFound, serverError, unAuthenticated} = handlerErrorBase(bus)

    function similarErrorHandler(err) {
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

    const getNotifications = similarErrorHandler

    const updateNotification = similarErrorHandler

    const deleteNotification =similarErrorHandler

    return {
        getNotifications,
        updateNotification,
        deleteNotification
    }

}