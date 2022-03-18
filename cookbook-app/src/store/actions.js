export default {
    sayNotLoggedIn(){
        return new Promise((resolve, reject) => reject({ message: 'You are not logged in.' }))
    },
    initialization({commit, getters, dispatch}, session){
        commit('session/set', session)
        if(getters['session/isLoggedIn']){
            const promises = []
            promises.push(dispatch('notifications/not-read'))
            promises.push(dispatch('chats/not-read'))
            if(getters['session/isSigned']) {
                promises.push(dispatch('shopping-list/get'))
                promises.push(dispatch('friendships/own'))
            }
            return Promise.all(promises)
        }
        return Promise.resolve()
    },
    reset({commit}){
        commit('session/end')
        commit('notifications/reset')
        commit('chats/reset')
        commit('shopping-list/reset')
        commit('friendships/reset')
    }
}