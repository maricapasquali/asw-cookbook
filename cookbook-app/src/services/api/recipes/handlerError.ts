import {badRequest, forbidden, notFound, serverError, unAuthenticated} from "../handler-common-error";

import * as handlerErrorLike from './likes/handlerError'
import * as handlerErrorComment from './comments/handlerError'

export const likes = handlerErrorLike
export const comments = handlerErrorComment

export function allSharedRecipes(err: any): void {
    switch (err.response?.status) {
        case 401: return unAuthenticated(err)
    }
    return serverError(err)
}

export function getNumberRecipesForCountry(err: any): boolean {
    switch (err.response?.status) {
        case 401: unAuthenticated(err)
        break
        default: serverError(err)
        break
    }
    return false
}

export function getRecipe(err: any, info?: any): boolean {
    switch (err.response?.status) {
        case 400: {
            badRequest(err)
            return false
        }
        case 401: {
            unAuthenticated(err, info)
            return false;
        }
        case 403: {
            forbidden(err)
            return false
        }
        case 404: return true;
    }
    serverError(err)
    return false
}

function similarHandlerError(err: any, notFoundResource?: {name:string, id:string}): void {
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
            notFound(err, notFoundResource || { name: 'Ricetta', id: err.response.config?.urlParams?.recipeID })
            break
        default:
            serverError(err)
            break
    }
}

export const createRecipe = (err: any): void => similarHandlerError(err, { name: 'Utente', id: err.response.config?.urlParams?.userID })

export const updateRecipe = (err: any): void => similarHandlerError(err)

export const deleteRecipe = (err: any): void => similarHandlerError(err)