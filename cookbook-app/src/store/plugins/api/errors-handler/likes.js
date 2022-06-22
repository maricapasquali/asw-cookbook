import handlerErrorBase from "./base"

export default function (bus) {
    const { badRequest, forbidden, notFound, serverError, unAuthenticated } = handlerErrorBase(bus)

    function makeOrUnmakeLike(err) {
        switch (err.response?.status) {
            case 400:
                badRequest(err)
                break
            case 401:
                unAuthenticated(err)
                break
            case 403:
                forbidden(err)
                break
            case 404: {
                let resource = { name:"Ricetta", id: err.response.config?.urlParams?.recipeID }
                if (err.response.config?.urlParams?.likeID) {
                    resource.name = "Like"
                    resource.id = err.response.config?.urlParams?.likeID
                } else if (err.response.config?.params?.commentID) {
                    resource.name = "Commento"
                    resource.id = err.response.config?.params?.commentID
                }
                notFound(err, resource)
            }
                break
            default:
                serverError(err)
                break
        }
    }

    return {
        makeOrUnmakeLike
    }
}
