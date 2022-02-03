import {badRequest, forbidden, notFound, serverError, unAuthenticated} from "../../handler-common-error";

export function makeOrUnmakeLike(err: any):void {
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
            let resource: any = { name:'Ricetta', id: err.response.config?.urlParams?.recipeID}
            if(err.response.config?.urlParams?.likeID) {
                resource.name = 'Like'
                resource.id = err.response.config?.urlParams?.likeID
            }
            else if(err.response.config?.params?.commentID) {
                resource.name = 'Commento'
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