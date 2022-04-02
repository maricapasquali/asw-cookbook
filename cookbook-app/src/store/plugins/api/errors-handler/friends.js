import handlerErrorBase from './base'

export default function (bus) {
    const {badRequest, forbidden, notFound, serverError, unAuthenticated} = handlerErrorBase(bus)

    function requestFriendShip(err, info) {
        switch (err.response?.status) {
            case 400:
                badRequest(err)
                break
            case 401:
                unAuthenticated(err, info)
                break
            case 403:
                forbidden(err)
                break
            case 404:
                notFound(err, { name: 'Utente', id: err.response?.config?.urlParams?.id })
                break
            case 409: return err.response?.data?.actualState
            default:
                serverError(err)
                break
        }
        return false
    }

    function breakFriendShip(err, info) {
        switch (err.response?.status) {
            case 400:
                badRequest(err)
                break
            case 401:
                unAuthenticated(err, info)
                break
            case 403:
                forbidden(err)
                break
            case 404:
                notFound(err, { name: 'Amicizia' })
                break
            default:
                serverError(err)
                break
        }
    }

    function getFriendOf(err, info) {
        switch (err.response?.status) {
            case 400: break
            case 401:
                unAuthenticated(err, info || {_forbiddenPage: false})
                break
            default:
                serverError(err)
                break
        }
    }

    function updateFriendShip(err, info) {
        switch (err.response?.status) {
            case 400:
                badRequest(err)
                break
            case 401:
                unAuthenticated(err, info)
                break
            case 403:
                forbidden(err)
                break
            case 404:
                notFound(err, { name: 'Amicizia' })
                break
            case 409: return err.response?.data?.actualState
            default:
                serverError(err)
                break
        }
        return false
    }

    return  {
        requestFriendShip,
        breakFriendShip,
        getFriendOf,
        updateFriendShip
    }
}
