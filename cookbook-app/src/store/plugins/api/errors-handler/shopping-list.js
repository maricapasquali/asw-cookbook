import handlerErrorBase from './base'
export default function (bus){
    const {badRequest, forbidden, notFound, serverError, unAuthenticated} = handlerErrorBase(bus)

    function similarErrorHandler(err) {
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
                let resource = {name: 'Utente', id:  err.response?.config?.urlParams?.userID }
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

    function createShoppingListPoint(err) {
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
                let data
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

    const updateShoppingListPoint = similarErrorHandler

    const deleteShoppingListPoint = similarErrorHandler

    const getShoppingList = similarErrorHandler

    return {
        createShoppingListPoint,
        updateShoppingListPoint,
        deleteShoppingListPoint,
        getShoppingList
    }
}