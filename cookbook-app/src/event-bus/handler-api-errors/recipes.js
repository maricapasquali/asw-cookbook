import handlerErrorBase from './base'
export default function (bus){
    const {badRequest, forbidden, notFound, serverError, unAuthenticated, duplicateResource} = handlerErrorBase(bus)

    function similarHandlerError(err, notFoundResource) {
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
            case 409: // not in delete recipe
                duplicateResource(err, "Esiste già una ricetta con questo nome.")
                break
            default:
                serverError(err)
                break
        }
    }

    function allSharedRecipes(err) {
        switch (err.response?.status) {
            case 401: return unAuthenticated(err)
        }
        serverError(err)
    }

    function getNumberRecipesForCountry(err) {
        switch (err.response?.status) {
            case 401: unAuthenticated(err)
                break
            default: serverError(err)
                break
        }
        return false
    }

    function getRecipe(err, info) {
        switch (err.response?.status) {
            case 400:
                return true
            case 401:
                unAuthenticated(err, info)
                return false;
            case 403:
                forbidden(err)
                return false
            case 404: return true;
        }
        serverError(err)
        return false
    }

    const createRecipe = (err) => similarHandlerError(err, { name: 'Utente', id: err.response.config?.urlParams?.userID })

    const updateRecipe = (err) => similarHandlerError(err)

    const deleteRecipe = (err) => similarHandlerError(err)

    return {
        allSharedRecipes,
        getNumberRecipesForCountry,
        getRecipe,
        createRecipe,
        updateRecipe,
        deleteRecipe
    }
}
