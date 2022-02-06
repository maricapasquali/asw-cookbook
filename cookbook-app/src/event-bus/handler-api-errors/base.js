export default function (bus){

    function printError(response) {
        console.error(response.status ,  (response.data?.description ? ' - ' + response.data?.description : ''))
    }

    function badRequest(errOfRequest) {
        if (errOfRequest.response?.status === 400) {
            printError(errOfRequest.response)
            bus.$emit('show:error:bad-request', {
                status: errOfRequest.response?.status,
                message: errOfRequest.response.data?.description || errOfRequest.message || 'Unknown error',
                config: errOfRequest.config
            })
        }
    }

    function unAuthenticated(errOfRequest, errInfo) {
        if (errOfRequest.response?.status === 401) {
            printError(errOfRequest.response)
            bus.$emit('show:error:unauthenticated', {...errInfo, show: true})
        }
    }

    function forbidden(errOfRequest) {
        if (errOfRequest.response?.status === 403) {
            printError(errOfRequest.response)
            bus.$emit('show:error:forbidden', {
                show: true,
                method: errOfRequest.response?.config?.method
            })
        }
    }

    function notFound(errOfRequest, resource) {
        if (errOfRequest.response?.status === 404) {
            printError(errOfRequest.response)
            bus.$emit('show:error:not-found', {
                show: true,
                resource
            })
        }
    }

    function serverError(errOfRequest, propagation = true) {
        let error = 'Internal Server Error'
        if (errOfRequest.response?.status >= 500) printError(errOfRequest.response)
        else  error = errOfRequest?.response?.data?.description ||
                        errOfRequest?.response?.statusText ||
                        errOfRequest?.message ||
                        'Unknown error'

        printError({status: 'Error', data: { description: error } } )
        if(propagation)
            bus.$emit('show:error:server-internal', {
                status: errOfRequest?.response?.status,
                message: error,
                config: errOfRequest?.config
            })
        return error
    }

    return {
        badRequest,
        unAuthenticated,
        forbidden,
        notFound,
        serverError
    }
}