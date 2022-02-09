import api from '@api'
export default {
    create({rootGetters, dispatch, rootState}, {chatID, data}){
        let isLoggedIn = rootGetters['session/isLoggedIn']
        if(!isLoggedIn) return dispatch('sayNotLoggedIn', null, { root: true })
        return api.chats.messages.createMessage(rootState.session.user._id, chatID, data, rootState.session.accessToken)
    },

    read({rootGetters, dispatch, rootState},{chatID, messagesIds}){
        let isLoggedIn = rootGetters['session/isLoggedIn']
        if(!isLoggedIn) return dispatch('sayNotLoggedIn', null, { root: true })
        return api.chats.messages.readMessages(rootState.session.user._id, chatID, {messages: messagesIds} , rootState.session.accessToken)
    }

}