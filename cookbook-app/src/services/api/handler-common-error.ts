import store from '../../store'

function printError(response: any): void {
    console.error(response.status + (response.data?.description ? ' - ' + response.data?.description : ''))
}

export function badRequest(errOfRequest: any): void {
    if (errOfRequest.response?.status === 400) {
        printError(errOfRequest.response)
        store.commit('showBadRequestError', {
            status: errOfRequest.response?.status,
            message: errOfRequest.response.data?.description || errOfRequest.message || 'Unknown error',
            config: errOfRequest.config
        })
    }
}

export function unAuthenticated(errOfRequest: any, errInfo?: any): void {
    if (errOfRequest.response?.status === 401) {
        printError(errOfRequest.response)
        store.commit('showUnAuthenticatedError', {...errInfo, show: true})
    }
    store.commit('showUnAuthenticatedError', {...errInfo, show: true})
}

export function forbidden(errOfRequest: any): void {
    if (errOfRequest.response?.status === 403) {
        printError(errOfRequest.response)
        store.commit('showForbiddenError', {
            show: true,
            method: errOfRequest.response?.config?.method
        })
    }
}

export function notFound(errOfRequest: any, resource: any): void {
    if (errOfRequest.response?.status === 404) {
        printError(errOfRequest.response)
        store.commit('showNotFoundError', {
            show: true,
            resource
        })
    }
}

export function serverError(errOfRequest: any): void {
    let error: string = 'Internal Server Error'
    if (errOfRequest.response?.status >= 500) printError(errOfRequest.response)
    else {
        error = errOfRequest.response?.data.description || errOfRequest.message || 'Unknown error'
        printError({status: 'Error', data: { description: error } } )
    }
    store.commit('showServerError', {
        status: errOfRequest.response?.status,
        message: error,
        config: errOfRequest.config
    })
}