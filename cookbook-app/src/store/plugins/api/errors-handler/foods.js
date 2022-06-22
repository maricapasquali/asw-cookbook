import handlerErrorBase from "./base"

export default function (bus) {

    const { badRequest, forbidden, notFound, serverError, unAuthenticated } = handlerErrorBase(bus)

    function similarErrorHandler(err, info) {
        switch (err.response?.status) {
            case 400:
                badRequest(err)
                break
            case 401:
                unAuthenticated(err, info)
                break
            default:
                serverError(err)
                break
        }
    }

    function getFoods(err) {
        return similarErrorHandler(err, { _forbiddenPage: true })
    }

    function createFood(err) {
        switch (err.response?.status) {
            case 400:
                badRequest(err)
                break
            case 401:
                unAuthenticated(err, { _forbiddenPage: true })
                break
            case 403:
                forbidden(err)
                break
            case 409: return true
            default:
                serverError(err)
                break
        }
        return false
    }

    function updateFood(err) {
        switch (err.response?.status) {
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
                notFound(err, { name: "Cibo", id: err.response?.config?.urlParams?.id })
                break
            default:
                serverError(err)
                break
        }
        return false
    }

    const searchFood = similarErrorHandler

    function getFood(err, info) {
        switch (err.response?.status) {
            case 400:
                badRequest(err)
                break
            case 401:
                unAuthenticated(err, info)
                break
            case 404:
                break
            default:
                serverError(err)
                break
        }
    }

    return {
        getFoods,
        createFood,
        updateFood,
        searchFood,
        getFood
    }
}
