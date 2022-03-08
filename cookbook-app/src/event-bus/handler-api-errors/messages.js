import handlerErrorBase from './base'
export default function (bus) {
    const {badRequest, forbidden, notFound, serverError, unAuthenticated} = handlerErrorBase(bus)

    const errInfo = {_forbiddenPage: true}

    function commonHandler(err, resourceNotFound){
        switch (err.response?.status) {
            case 400:
                badRequest(err)
                break
            case 401:
                unAuthenticated(err, errInfo)
                break
            case 403:
                forbidden(err)
                break
            case 404:
                notFound(err, resourceNotFound)
                break
            default:
                serverError(err)
                break
        }
        return false
    }
    // messages
    function readMessages(err){
        commonHandler(err, {name: 'Chat/Messaggi'})
    }
    function createMessage(err){
        return commonHandler(err, {name: 'Chat', id: err?.response?.config?.urlParams?.chatID})
    }
    function listMessages(err){
        commonHandler(err, {name: 'Chat', id: err?.response?.config?.urlParams?.chatID})
    }

    // attachments
    function updatePermissionAttachment(err){
        commonHandler(err, { name: 'Ricetta/Utenti' })
    }
    function getAttachments(err){
        commonHandler(err, {name: 'Utente', id: err?.response?.config?.urlParams?.userID})
    }
    function getAttachment(err){
        commonHandler(err, {name: 'Ricetta', id: err?.response?.config?.urlParams?.recipeID})
    }

    return {
        readMessages,
        createMessage,
        listMessages,

        updatePermissionAttachment,
        getAttachments,
        getAttachment
    }
}