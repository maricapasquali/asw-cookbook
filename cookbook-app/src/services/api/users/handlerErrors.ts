import {badRequest, forbidden, notFound, serverError, unAuthenticated} from "../handler-common-error";

import * as handlerErrorSession from './session/handlerError'

export const session = handlerErrorSession

function _badRequestString(err: any): string {
    return 'Bad Request' + ( err.response?.data?.description ? ' : ' + err.response?.data?.description: '')
}

export function signUp(err: any): string {
    console.error(err)
    switch(err.response?.status) {
        case 400: return _badRequestString(err)
        case 409: return 'UserID già utilizzato.'
        default: return serverError(err, false)
    }
}

export function emailResetPassword(err: any): string {
    console.error(err)
    switch(err.response?.status) {
        case 400: return _badRequestString(err)
        case 404: return 'Email non è associata a nessun account.'
        default: return serverError(err, false)
    }
}

export function checkAccount(err: any): string {
    console.error(err)
    switch (err.response?.status){
        case 400: return 'LINK NON VALIDO'
        case 404: return 'UTENTE NON TROVATO/VALIDO'
        default: return serverError(err, false)
    }
}

export function getUser(err: any, info: any): boolean {
    switch(err.response?.status) {
        case 400:
            badRequest(err)
            break
        case 401:
            unAuthenticated(err, info)
            break
        case 404:
            if(info._forbiddenPage) {
                err.response.status = 403
                forbidden(err)
                return false
            }
            return true
        default:
            serverError(err)
    }
    return false
}

export function updateUser(err: any): void {
    switch(err.response?.status) {
        case 400:
            badRequest(err)
            break
        case 401:
            unAuthenticated(err, { _forbiddenPage: true })
            break
        case 403:
            forbidden(err)
            break
        case 404:
            notFound(err, {name: 'Utente', id: err.response?.config?.urlParams?.id })
            break
        default:
            serverError(err)
    }
}

export function deleteAccount(err: any): string {
    console.error(err)
    switch (err.response?.status){
        case 400:
            badRequest(err)
            break
        case 401:
            unAuthenticated(err, {_forbiddenPage: true})
            break;
        case 403: return 'Non sei autorizzato a cancellare quest\'account.'
        case 404: return 'Utente non trovato.'
        default: return serverError(err, false)
    }
}

function changeCredential(err: any, credential: 'username' | 'password' ): string{
    console.error(err)
    switch (err.response?.status){
        case 400: return _badRequestString(err)
            break
        case 401: unAuthenticated(err, {_forbiddenPage: true})
            break;
        case 403: return 'Non sei autorizzato a cambiare ' + credential + ' di quest\'account.'
        case 404: return 'Utente non trovato.'
        case 409: {
            if(credential === 'username') return 'Username non corretto.'
            if(credential === 'password') return 'Password non corretta.'
        }
        break
        default: return serverError(err, false)
    }
}

export const changeUserID = (err: any): string  => changeCredential(err, 'username')

export const changePassword = (err: any): string => changeCredential(err, 'password')

export function resetPassword(err: any): string {
    console.error(err)
    switch (err.response?.status){
        case 400:
            badRequest(err)
            break
        case 404: return 'Utente non trovato.'
        default: {
            let status = err.response?.status
            if(status === 401 || status === 403)
                return 'Non sei autorizzato a effettuare questa operazione.'
            return serverError(err, false)
        }
    }
}

export function checkLinkResetPassword(err: any): string{
    console.error(err)
    switch (err.response?.status){
        case 400: return _badRequestString(err)
        case 404: return "Link non valido."
        case 410: return "Link scaduto. Richiedine uno nuovo."
        default: return serverError(err, false)
    }
}

export function getUserFromNickname(err: any): string {
    console.error(err)
    switch (err.response?.status){
        case 400: return _badRequestString(err)
        case 404: return 'Utente non trovato.'
        default: return serverError(err, false)
    }
}

export function getUsersWithAndWithoutFilters(err: any, info?: any): void {
    switch (err.response?.status) {
        case 400:
            badRequest(err)
            break
        case 401:
            unAuthenticated(err, info || { _forbiddenPage: false })
            break
        default:
            serverError(err)
            break
    }
}