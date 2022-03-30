import handlerErrorBase from './base'
export default function (bus){
    const {badRequest, forbidden, notFound, serverError, unAuthenticated} = handlerErrorBase(bus)

    function similarErrorHandler(err) {
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
                let resource = {name: 'Ricetta', id: err.response.config?.urlParams?.recipeID}
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

    const createCommentOrResponse = (err) => similarErrorHandler(err)
    const deleteComment = (err) => similarErrorHandler(err)
    const updateComment = (err) => similarErrorHandler(err)

    function getReportedComment(err) {
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

    return {
        createCommentOrResponse,
        deleteComment,
        updateComment,
        getReportedComment
    }
}