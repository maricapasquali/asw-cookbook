export default {
    sayNotLoggedIn(){
        return new Promise((resolve, reject) => reject({ message: 'You are not logged in.' }))
    },
    initialization({commit, getters, dispatch}, session){
        commit('session/set', session)
        if(getters['session/isLoggedIn']){
            let unreadNotification = dispatch('notifications/not-read');
            let unreadChatMessage = dispatch('session/getNumberOfUnReadChatsMessages');
            let shoppingList = dispatch('shopping-list/get');
            return Promise.all([unreadNotification, unreadChatMessage, shoppingList])
        }
        return Promise.resolve()
    },
    reset({commit}){
        commit('session/end')
        commit('notifications/reset')
        commit('shopping-list/reset')
    }
}