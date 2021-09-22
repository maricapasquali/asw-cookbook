export function login(err: any): string {
    let error: string = 500 + ' - ' + err.message

    if(err.response){
        error = err.response.status + ' - '
        switch (err.response.status){
            case 403:
            {
                if(err.response.data.signup){
                    error += 'Utente ancora da verificare.'
                }else{
                    error += 'Credenziali non corrette.'
                }
            }
                break
            case 404:
                error += 'Utente non esiste'
                break
            default:
                error += err.response.data.description
                break
        }
    }
    return error
}

export function signUp(err: any): string {
    let error: string = 500 + ' - ' + err.message
    if(err.response){
        error = err.response.status + ' - ' + err.response.data.description
    }
    console.error(error)
    return error
}

export function emailResetPassword(err: any): string {
    let error: string = 500 + ' - ' + err.message
    if(err.response){
        switch (err.response.status){
            case 404:
                error = 'Email non è associata a nessun account.'
                break
            default:
                error = err.response.status + ' - ' + err.response.data.description
                break
        }
    }
    console.error(error)
    return error
}

export function checkAccount(err: any): string {
    let error: string = 500 + ' - ' + err.message
    if(err.response){
        switch (err.response.status){
            case 400:{
                error = 'LINK NON VALIDO'
            }
                break;
            case 404:{
                error = 'UTENTE NON TROVATO/VALIDO'
            }
                break
            case 500:{
                error = 500 + ' - ' + err.response.data.description
            }
                break
        }
    }
    console.error(error)
    return error
}

export function isAuthorized(err: any): string | void {
    let error: string = 500 + ' - ' + err.message
    if(err.response){
        if(err.response.status === 401) return;
        error = err.response.status + ' - '+ err.response.data.description
    }
    console.error(err)
    return error
}

export function getUser(err: any): string {
    let error: string = 500 + ' - ' + err.message
    if(err.response){
        switch (err.response.status){
            case 404:
                error = 'Utente non trovato.'
                break
            default:
                error = err.response.status + ' - ' + err.response.data.description
                break
        }
    }
    console.error(error)
    return error
}

export function updateUser(err: any): string | void {
    let error: string = 500 + ' - ' + err.message
    if(err.response){
        if(err.response.status === 401) return;
        error = err.response.status + ' - '+ err.response.data.description
    }
    console.error(error)
    return error
}

export function deleteAccount(err: any): string {
    let error: string = 500 + ' - ' + err.message
    if(err.response){
        if(err.response.status === 401) return;
        error = err.response.status + ' - ' + err.response.data.description
    }
    console.error(error)
    return error
}

export function changeUserID(err: any): string {
    let error: string = 500 + ' - ' + err.message
    if(err.response){
        if(err.response.status === 401) return;
        error = err.response.status + ' - ' + err.response.data.description
    }
    console.error(error)
    return error
}

export function changePassword(err: any): string {
    let error: string = 500 + ' - ' + err.message
    if(err.response){
        if(err.response.status === 401) return;
        error = err.response.status + ' - ' + err.response.data.description
    }
    console.error(error)
    return error
}

export function logout(err: any): string {
    let error: string = 500 + ' - ' + err.message
    if(err.response){
        if(err.response.status === 409) return;
        error = err.response.status + ' - ' + err.response.data.description
    }
    console.error(error)
    return error
}

export function checkLinkResetPassword(err: any): string{
    let error: string = 500 + ' - ' + err.message
    if(err.response){
        error = err.response.status + ' - '
        switch (err.response.status){
            case 404:
            {
                error += "KEY non valida"
            }
                break
            case 410:
            {
                error += "Link scaduto. Richiedine uno nuovo."
            }
                break
            default:
                error += err.response.data.description
                break
        }
    }
    console.error(error)
    return error
}

export function getUserFromNickname(err: any): string {
    let error: string = 500 + ' - ' + err.message
    if(err.response){
        error = err.response.status + ' - ' + err.response.data.description
    }
    console.error(error)
    return error
}