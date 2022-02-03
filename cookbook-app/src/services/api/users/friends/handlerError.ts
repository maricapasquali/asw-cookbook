import {badRequest, forbidden, notFound, serverError, unAuthenticated} from "../../handler-common-error";

export function requestFriendShip(err: any, info: any): boolean {
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
        case 409: return true
        default:
            serverError(err)
            break
    }
    return false
}

export function breakFriendShip(err: any, info: any): void {
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

export function getFriendOf(err: any, info?: any): void {
    switch (err.response?.status) {
        case 400:
            badRequest(err)
            break
        case 401:
            unAuthenticated(err, info || {_forbiddenPage: false})
            break
        default:
            serverError(err)
            break
    }
}

export function updateFriendShip(err: any, info: any): string | boolean {
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