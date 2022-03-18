import handlerErrorBase from './base'
export default function (bus) {
    const {badRequest, forbidden, notFound, serverError, unAuthenticated} = handlerErrorBase(bus)

    const errInfo = {_forbiddenPage: true}

    function handlerCommonError(err){
        switch (err.response?.status) {
            case 400:
                badRequest(err)
                return true
            case 401:
                unAuthenticated(err, errInfo)
                return true
            case 403:
                forbidden(err)
                return true
        }
        return false
    }

    function createChat(err){
        if(!handlerCommonError(err)) {
            switch (err.response?.status){
                case 404:
                    notFound(err, { name: 'Utente', id: err.response.config?.urlParams?.id })
                    break;
                case 409:
                    let {chatID} = err.response.data
                    console.debug('existed chat = ', chatID)
                    return chatID;
                default:
                    serverError(err)
                    break;
            }
        }
        return false
    }

    function getChats(err){
        if(!handlerCommonError(err)) serverError(err)
    }

    function getChat(err){
        if(!handlerCommonError(err)) {
            switch (err.response?.status){
                case 404:
                    return true
                default:
                    serverError(err)
                    break;
            }
        }
        return false
    }

    function getNewChat(err){
        switch (err.response?.status) {
            case 400:
                console.error('400 - ' + err.response.data?.description)
                break;
            case 401:
                unAuthenticated(err, errInfo)
                break;
            case 403:
                forbidden(err)
                break;
            case 404:
                console.error('404 - ' + err.response.data?.description)
                break;
            default:
                serverError(err)
                break;
        }
    }

    function getRecipeOnChat(err) {
        if(!handlerCommonError(err)){
            switch (err.response?.status){
                case 404:
                    return true
                default:
                    serverError(err)
                    break;
            }
        }
        return false
    }

    function deleteChat(err){
        if(!handlerCommonError(err)) {
            switch (err.response?.status){
                case 404:
                    notFound(err, { name: 'Chat', id: err.response.config?.urlParams?.chatID })
                    break
                default:
                    serverError(err)
                    break;
            }
        }
    }

    function getFriendOnChat(err){
        switch (err.response?.status) {
            case 400:
                badRequest(err)
                break;
            case 401:
                unAuthenticated(err, errInfo)
                break;
            default:
                serverError(err)
                break;
        }
        return false
    }

    function updateUserRoleInChat(err){
        if(!handlerCommonError(err)){
            switch (err.response?.status){
                case 404:
                    console.error('404 - ', err.response.data)
                    break
                default:
                    serverError(err)
                    break;
            }
        }
    }


    return {
        createChat,
        getChats,
        getChat,
        getNewChat,
        getRecipeOnChat,
        deleteChat,
        updateUserRoleInChat,

        getFriendOnChat
    }
}