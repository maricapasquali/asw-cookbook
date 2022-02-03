import {badRequest, forbidden, notFound, serverError, unAuthenticated} from "../handler-common-error";

function similarErrorHandler(err: any, info: any): void{
    switch (err.response?.status) {
        case 400:
            badRequest(err)
            break
        case 401:
            unAuthenticated(err, info)
            break
        default:
            serverError(err)
            break
    }
}

export const getFoods = (err: any): void => similarErrorHandler(err, {_forbiddenPage: true})

export function createFood(err: any): boolean {
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
        case 409: return true
        default:
            serverError(err)
            break
    }
    return false
}

export function updateFood(err: any): boolean {
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
            notFound(err, {name: 'Cibo', id: err.response?.config?.urlParams?.id})
            break
        default:
            serverError(err)
            break
    }
    return false
}

export const searchFood = similarErrorHandler

export function getFood(err: any, info: any): void{
    switch (err.response?.status) {
        case 400:
            badRequest(err)
            break
        case 401:
            unAuthenticated(err, info)
            break
        case 404:
            break
        default:
            serverError(err)
            break
    }
}
