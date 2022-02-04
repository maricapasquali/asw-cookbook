import {forbidden, serverError} from "../../handler-common-error";

export function login(err: any): string {
    console.error(err)
    switch (err.response?.status){
        case 403: {
            if(err.response?.data?.signup) return 'Utente ancora da verificare.'
            else if(err.response?.data?.blocked) return 'Account Bloccato.'
            else return 'Credenziali non corrette.'
        }
        case 404: return 'Utente non trovato.'
        default: return serverError(err, false)
    }
}

export function logout(err: any): string {
    let error: string = 500 + ' - ' + err.message
    if(err.response) error = err.response.status + ' - ' + err.response?.data?.description
    console.error(error)
    return error
}

export const checkAccessToken = (description: string) => serverError({ response: { status: 500, data: { description } } })

export const wrongUserSession = () => forbidden({ response: { status: 403 } })