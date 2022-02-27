import api from '@api'
export default {
    create({rootGetters, dispatch, rootState}, {chatID, data}){
        let isLoggedIn = rootGetters['session/isLoggedIn']
        if(!isLoggedIn) return dispatch('sayNotLoggedIn', null, { root: true })
        return api.chats.messages.createMessage(rootState.session.user._id, chatID, data, rootState.session.accessToken)
    },

    read({rootGetters, commit, dispatch, rootState},{chatID, messagesIds}){
        let isLoggedIn = rootGetters['session/isLoggedIn']
        if(!isLoggedIn) return dispatch('sayNotLoggedIn', null, { root: true })
        return api.chats.messages.readMessages(rootState.session.user._id, chatID, {messages: messagesIds} , rootState.session.accessToken)
            .then(response => {
                console.debug(response)
                if(response.status === 204) return console.debug('Messages ('+messagesIds+') have already read.');
                messagesIds.forEach(() => commit('chats/remove-unread', null, { root: true }))
                return response
            })
    },
    all({rootGetters, commit, dispatch, rootState},{chatID, options}){
        let isLoggedIn = rootGetters['session/isLoggedIn']
        if(!isLoggedIn) return dispatch('sayNotLoggedIn', null, { root: true })
        return api.chats.messages.all(rootState.session.user._id, chatID, rootState.session.accessToken, options)

    }
}