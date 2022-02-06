import api from '@api'

export default {
    init({commit, state, dispatch, getters}, session){
        commit('setSession', session)
        return dispatch('getAllBackgroundInformation')
    },

    getAllBackgroundInformation({dispatch, getters}){
        if(getters.isLoggedIn){
            let unreadNotification = dispatch('getNumberOfUnReadNotifications');
            let unreadChatMessage = dispatch('getNumberOfUnReadChatsMessages');
            return Promise.all([unreadNotification, unreadChatMessage])
        }
        return Promise.resolve()
    },
    sayNotLoggedIn(){
        return new Promise((resolve, reject) => reject('You not logged in.'))
    },

    login({dispatch, commit}, credential){
        return api.users
                  .session.login(credential)
                  .then(({data}) => {
                      let {token, userInfo} = data
                      commit('setSession', {...token, user: userInfo})
                      return {
                          name: data.firstLogin ? 'change-password' : 'p-user-account',
                          params: { id: userInfo._id, firstLogin: data.firstLogin ? true : undefined},
                      }
                  })
    },

    logout({commit, dispatch, state, getters}){
        if(!getters.isLoggedIn) return dispatch('sayNotLoggedIn')
        return api.users
                  .session
                  .logout(state.user._id, state.accessToken)
                  .then(({data}) => {
                      console.debug("Logout : ", data)
                      commit('endSession')
                  })
    },

    requestNewAccessToken({commit, getters, dispatch, state}){
        if(!getters.isLoggedIn) return dispatch('sayNotLoggedIn')
        return api.users
                .session
                .newAccessToken(state.user._id, { refresh_token: state.refreshToken }, state.accessToken)
                .then(response => {
                    commit('setAccessToken', response.data.access_token)
                    return response
                })
                .catch(error => {
                    console.error(error.response || error.message)
                    if(error.response && error.response.status === 401) commit('endSession')
                    return error
                })
    },

    getNumberOfUnReadNotifications({commit, getters, dispatch, state}){
        if(!getters.isLoggedIn) return dispatch('sayNotLoggedIn')
        return api.notifications
                .getNotifications(state.user._id, state.accessToken, { readed: false })
                .then(({data}) => {
                    console.debug('unread-notification : ', data)
                    commit('addUnReadNotification', data.total)
                })
    },

    getNumberOfUnReadChatsMessages({commit, getters, dispatch, state}){
        if(!getters.isLoggedIn) return dispatch('sayNotLoggedIn')
        return api.chats
                .getChats(state.user._id, state.accessToken, { 'unread-messages' : true })
                .then(({data}) => {
                    console.debug('unread-messages : ', data)
                    let unReadMessages = data.items.reduce((acc, current)=> acc += current.messages.length, 0)
                    console.debug('unread-chat : ', data, ', # unread-messages : ', unReadMessages)
                    if(unReadMessages > 0) commit('addUnReadMessage', unReadMessages)
                })
    },
}