import api from '@api'

export default {
    login({dispatch, commit}, credential){
        return api.users
                  .session
                  .login(credential)
                  .then(({data}) => {
                      let {token, userInfo} = data
                      dispatch('initialization', {...token, user: userInfo}, { root: true })
                          .then(() => console.log('initialization on login ...') )
                          .catch(err => console.error('initialization error ', err))
                      return {
                          name: data.firstLogin ? 'change-password' : 'p-user-account',
                          params: { id: userInfo._id, firstLogin: data.firstLogin ? true : undefined},
                      }
                  })
    },

    logout({dispatch, state, getters}){
        if(!getters.isLoggedIn) return dispatch('sayNotLoggedIn', null, { root: true })
        return api.users
                  .session
                  .logout(state.user._id, state.accessToken)
                  .then(({data}) => {
                      console.debug("Logout : ", data)
                      dispatch('reset', null, { root: true })
                  })
    },

    requestNewAccessToken({commit, getters, dispatch, state}){
        if(!getters.isLoggedIn) return dispatch('sayNotLoggedIn', null, { root: true })
        return api.users
                  .session
                  .newAccessToken(state.user._id, { refresh_token: state.refreshToken }, state.accessToken)
                  .then(response => {
                      commit('set-access-token', response.data.access_token)
                      return response
                  })
                  .catch(error => {
                      console.error(error.response || error.message)
                      if(error.response && error.response.status === 401) dispatch('reset', null, { root: true })
                      return error
                  })
    },

    /*TODO: move on store/chat/actions */
    getNumberOfUnReadChatsMessages({commit, getters, dispatch, state}){
        if(!getters.isLoggedIn) return dispatch('sayNotLoggedIn', null, { root: true })
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