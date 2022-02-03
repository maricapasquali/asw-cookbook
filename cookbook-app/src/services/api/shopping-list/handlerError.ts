import {badRequest, forbidden, notFound, serverError, unAuthenticated} from "../handler-common-error";

export function createShoppingListPoint(err: any): boolean {
    switch (err.response?.status) {
        case 400:
            badRequest(err)
            break
        case 401:
            unAuthenticated(err, {_forbiddenPage: true})
            break
        case 403:
            forbidden(err)
            break
        case 404:
            let data: any
            try { data = JSON.parse(err.response?.config?.data) } catch (e){ /*ignored*/ }
            notFound(err, { name: 'Cibo', id: data?.food })
        break
        case 409: return true
        default:
            serverError(err)
            break
    }
    return false
}

function similarErrorHandler(err: any): void {
    switch (err.response?.status) {
        case 400:
            badRequest(err)
            break
        case 401:
            unAuthenticated(err, {_forbiddenPage: true})
            break
        case 403:
            forbidden(err)
            break
        case 404:
            let resource: any = {name: 'Utente', id:  err.response?.config?.urlParams?.userID }
            if(err.response?.config?.urlParams?.pointID) {
                resource.name = 'Punto della lista'
                resource.id =  err.response?.config?.urlParams?.pointID
            }
            notFound(err, resource)
            break
        default:
            serverError(err)
            break
    }
}

export const updateShoppingListPoint = similarErrorHandler

export const deleteShoppingListPoint = similarErrorHandler

export const getShoppingList = similarErrorHandler