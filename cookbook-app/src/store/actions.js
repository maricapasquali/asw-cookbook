import router from '../router'
import api from '@api'
export default {
    getNumberOfUnReadNotifications({commit, state}){
        if(state.user && state.accessToken)
         api.notifications
            .getNotifications(state.user._id, state.accessToken, { readed: false })
            .then(({data}) => {
                console.debug('unread-notification : ', data)
                commit('addUnReadNotification', data.total)
            })
            .catch(api.notifications.HandlerError.getNotifications)
    },
    getNumberOfUnReadChatsMessages({commit, state}){
        if(state.user && state.accessToken)
            api.chats
               .getChats(state.user._id, state.accessToken, { 'unread-messages' : true })
               .then(({data}) => {
                   console.debug('unread-messages : ', data)
                   let unReadMessages = data.items.reduce((acc, current)=> acc += current.messages.length, 0)
                   console.debug('unread-chat : ', data, ', # unread-messages : ', unReadMessages)
                   if(unReadMessages > 0) commit('addUnReadMessage', unReadMessages)
               })
               .catch(err => console.error(err))
    },
    logout({commit, state}, routeName){
        if(state.user && state.accessToken){
            state.logoutOn = true
            api.users
                .session
                .logout(state.user._id, state.accessToken)
                .then(({data}) => {
                    console.debug("Logout : ", data)
                    commit('endSession')
                    if(routeName === 'homepage') router.go()
                    else router.replace({name: 'homepage'})
                })
                .catch(api.users.HandlerErrors.session.logout)
                .finally(() => state.logoutOn = false)
        }
    },
    requestNewAccessToken({commit, state}){
        if(state.user && state.accessToken && state.refreshToken)
            api.users
               .session
               .newAccessToken(state.user._id, { refresh_token: state.refreshToken }, state.accessToken)
               .then(({data}) => commit('setAccessToken', data.access_token))
               .catch(error => {
                    console.error(error.response || error.message)
                    if(error.response && error.response.status === 401) {
                        commit('endSession')
                        router.replace({ name: 'login' })
                    }
               })
    }
}