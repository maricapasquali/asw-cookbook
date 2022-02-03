import {badRequest, forbidden, notFound, serverError, unAuthenticated} from "../../handler-common-error";

function similarErrorHandler(err: any): boolean {
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
            let resource: any = {name: 'Ricetta', id: err.response.config?.urlParams?.recipeID}
            if(err.response.config?.urlParams?.commentID) {
                resource.name = 'Commento'
                resource.id = err.response.config?.urlParams?.commentID
            }
            notFound(err, resource)
        }
            break
        default:
            serverError(err)
            break
    }
    return false
}
export const createCommentOrResponse = (err: any): boolean => similarErrorHandler(err)
export const deleteComment = (err: any): boolean => similarErrorHandler(err)
export const updateComment = (err: any): boolean => similarErrorHandler(err)

export function getReportedComment(err: any): void {
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
        default:
            serverError(err)
            break
    }
}