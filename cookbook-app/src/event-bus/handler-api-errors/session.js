import handlerErrorBase from './base'
export default function (bus){
    const {forbidden, serverError} = handlerErrorBase(bus)

    function login(err) {
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

    function logout(err) {
        let error = 500 + ' - ' + err.message
        if(err.response) error = err.response.status + ' - ' + err.response?.data?.description
        console.error(error)
        return error
    }

    const checkAccessToken = (description) => serverError({ response: { status: 500, data: { description } } })

    const wrongUserSession = () => forbidden({ response: { status: 403 } })

    return {
        login,
        logout,
        checkAccessToken,
        wrongUserSession
    }
}