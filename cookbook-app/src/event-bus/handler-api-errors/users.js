import handlerErrorBase from './base'
export default function (bus){
    const {badRequest, forbidden, notFound, serverError, unAuthenticated} = handlerErrorBase(bus)

    function _badRequestString(err) {
        return 'Bad Request' + ( err.response?.data?.description ? ' : ' + err.response?.data?.description: '')
    }

    function changeCredential(err, credential){
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

    function signUp(err) {
        console.error(err)
        switch(err.response?.status) {
            case 400: return _badRequestString(err)
            case 409: return 'UserID già utilizzato.'
            default: return serverError(err, false)
        }
    }

    function emailResetPassword(err) {
        console.error(err)
        switch(err.response?.status) {
            case 400: return _badRequestString(err)
            case 404: return 'Email non è associata a nessun account.'
            default: return serverError(err, false)
        }
    }

    function checkAccount(err) {
        console.error(err)
        switch (err.response?.status){
            case 400: return 'LINK NON VALIDO'
            case 404: return 'UTENTE NON TROVATO/VALIDO'
            default: return serverError(err, false)
        }
    }

    function getUser(err, info) {
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

    function updateUser(err) {
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

    function deleteAccount(err) {
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

    const changeUserID = (err)  => changeCredential(err, 'username')

    const changePassword = (err) => changeCredential(err, 'password')

    function resetPassword(err) {
        console.error(err)
        switch (err.response?.status){
            case 400: return _badRequestString(err)
            case 401: return 'Sessione scaduta.'
            case 403: return 'Non sei autorizzato a resettare la password diquesto utente.'
            case 404: return 'Utente non trovato.'
            default: return serverError(err, false)
        }
    }

    function checkLinkResetPassword(err){
        console.error(err)
        switch (err.response?.status){
            case 400: return _badRequestString(err)
            case 404: return "Link non valido."
            case 410: return "Link scaduto. Richiedine uno nuovo."
            default: return serverError(err, false)
        }
    }

    function getUserFromNickname(err) {
        console.error(err)
        switch (err.response?.status){
            case 400: return _badRequestString(err)
            case 404: return 'Utente non trovato.'
            default: return serverError(err, false)
        }
    }

    function getUsersWithAndWithoutFilters(err, info) {
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

    return {
        signUp,
        emailResetPassword,
        checkAccount,
        getUser,
        updateUser,
        deleteAccount,
        changeUserID,
        changePassword,
        resetPassword,
        checkLinkResetPassword,
        getUserFromNickname,
        getUsersWithAndWithoutFilters
    }
}