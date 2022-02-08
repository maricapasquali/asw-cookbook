import api from '@api'

export default {
    ['not-read']({commit, rootGetters, dispatch, rootState}){
        let isLoggedIn = rootGetters['session/isLoggedIn']
        if(!isLoggedIn) return dispatch('sayNotLoggedIn', null, { root: true })
        return api.chats.getChats(rootState.session.user._id, rootState.session.accessToken, { 'unread-messages' : true })
            .then(({data}) => {
                console.debug('unread-messages : ', data)
                let unReadMessages = data.items.reduce((acc, current)=> acc += current.messages.length, 0)
                console.debug('unread-chat : ', data, ', # unread-messages : ', unReadMessages)
                if(unReadMessages > 0) commit('add-unread', unReadMessages)
            })
    },

    own({rootGetters, dispatch, rootState}){
        let isLoggedIn = rootGetters['session/isLoggedIn']
        if(!isLoggedIn) return dispatch('sayNotLoggedIn', null, { root: true })
        return api.chats.getChats(rootState.session.user._id, rootState.session.accessToken)
    },
    remove({rootGetters, dispatch, rootState}, chatID){
        let isLoggedIn = rootGetters['session/isLoggedIn']
        if(!isLoggedIn) return dispatch('sayNotLoggedIn', null, { root: true })
        return api.chats.removeChat(rootState.session.user._id, chatID, rootState.session.accessToken)
    },
    one({rootGetters, dispatch, rootState}, chatID){
        let isLoggedIn = rootGetters['session/isLoggedIn']
        if(!isLoggedIn) return dispatch('sayNotLoggedIn', null, { root: true })
        return api.chats.getChat(rootState.session.user._id, chatID, rootState.session.accessToken)
    },
    create({rootGetters, dispatch, rootState}, body){
        let isLoggedIn = rootGetters['session/isLoggedIn']
        if(!isLoggedIn) return dispatch('sayNotLoggedIn', null, { root: true })
        return api.chats.createChat(rootState.session.user._id, body, rootState.session.accessToken)
    },
    ['update-role']({rootGetters, dispatch, rootState}, {chatID, role}){
        let isLoggedIn = rootGetters['session/isLoggedIn']
        if(!isLoggedIn) return dispatch('sayNotLoggedIn', null, { root: true })
        return api.chats.updateRoleInChatOne(rootState.session.user._id, chatID, {role}, rootState.session.accessToken)
    }
}