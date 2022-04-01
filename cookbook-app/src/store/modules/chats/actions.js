

export default {
    ['not-read']({commit, rootGetters, dispatch, rootState}){
        let isLoggedIn = rootGetters['session/isLoggedIn']
        if(!isLoggedIn) return dispatch('sayNotLoggedIn', null, { root: true })
        return rootState._api.chats.getChats(rootState.session.user._id, rootState.session.accessToken, { 'no-messages' : true })
            .then(({data}) => {
                console.debug('unread-messages : ', data)
                let unReadMessages = data.items.reduce((acc, chat)=> acc += chat.unreadMessages, 0)
                console.debug('unread-chat : ', data, ', # unread-messages : ', unReadMessages)
                if(unReadMessages > 0) commit('add-unread', unReadMessages)
            })
    },

    own({rootGetters, dispatch, rootState}, payload){
        let {options} = payload || {}
        let isLoggedIn = rootGetters['session/isLoggedIn']
        if(!isLoggedIn) return dispatch('sayNotLoggedIn', null, { root: true })
        return rootState._api.chats.getChats(rootState.session.user._id, rootState.session.accessToken, null, options)
    },
    ['own-without-message']({rootGetters, dispatch, rootState}, payload){
        let {options} = payload || {}
        let isLoggedIn = rootGetters['session/isLoggedIn']
        if(!isLoggedIn) return dispatch('sayNotLoggedIn', null, { root: true })
        return rootState._api.chats.getChats(rootState.session.user._id, rootState.session.accessToken, { 'no-messages' : true } , options)
    },
    remove({rootGetters, dispatch, rootState}, chatID){
        let isLoggedIn = rootGetters['session/isLoggedIn']
        if(!isLoggedIn) return dispatch('sayNotLoggedIn', null, { root: true })
        return rootState._api.chats.removeChat(rootState.session.user._id, chatID, rootState.session.accessToken)
    },
    one({rootGetters, dispatch, rootState}, {chatID}){
        let isLoggedIn = rootGetters['session/isLoggedIn']
        if(!isLoggedIn) return dispatch('sayNotLoggedIn', null, { root: true })
        return rootState._api.chats.getChat(rootState.session.user._id, chatID, rootState.session.accessToken)
    },
    ['one-without-messages']({rootGetters, dispatch, rootState}, {chatID}){
        let isLoggedIn = rootGetters['session/isLoggedIn']
        if(!isLoggedIn) return dispatch('sayNotLoggedIn', null, { root: true })
        return rootState._api.chats.getChat(rootState.session.user._id, chatID, rootState.session.accessToken, { 'no-messages' : true })
    },
    create({rootGetters, dispatch, rootState}, body){
        let isLoggedIn = rootGetters['session/isLoggedIn']
        if(!isLoggedIn) return dispatch('sayNotLoggedIn', null, { root: true })
        return rootState._api.chats.createChat(rootState.session.user._id, body, rootState.session.accessToken)
    },
    ['update-role']({rootGetters, dispatch, rootState}, {chatID, role}){
        let isLoggedIn = rootGetters['session/isLoggedIn']
        if(!isLoggedIn) return dispatch('sayNotLoggedIn', null, { root: true })
        return rootState._api.chats.updateRoleInChatOne(rootState.session.user._id, chatID, {role}, rootState.session.accessToken)
    }
}
