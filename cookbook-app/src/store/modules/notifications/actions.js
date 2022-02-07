import api from '@api'

export default {
    all({ dispatch, rootState, rootGetters }) {
        console.log('API IN ROOOT STATE ',rootState)
        console.log('API IN ROOOT STATE ',rootGetters)
        let isLoggedIn = rootGetters['session/isLoggedIn']
        if(!isLoggedIn) return dispatch('sayNotLoggedIn', null, { root: true })
        return api.notifications.getNotifications(rootState.session.user._id, rootState.session.accessToken)
    },
    read({ commit, dispatch, getters, rootState, rootGetters }, notificationID){
        let isLoggedIn = rootGetters['session/isLoggedIn']
        if(!isLoggedIn) return dispatch('sayNotLoggedIn', null, { root: true })
        return api.notifications
            .updateNotification(rootState.session.user._id, notificationID, {read: true}, rootState.session.accessToken)
            .then(response => {
                commit('remove-unread')
                return response
            })
    },
    remove({ commit, dispatch, getters, rootState, rootGetters }, {_id, read}){
        let isLoggedIn = rootGetters['session/isLoggedIn']
        if(!isLoggedIn) return dispatch('sayNotLoggedIn', null, { root: true })
        return  api.notifications
            .deleteNotification(rootState.session.user._id, _id, rootState.session.accessToken)
            .then(response => {
                if(!read) commit('remove-unread')
                return response
            })
    },
    ['not-read']({ commit, dispatch, rootState, rootGetters }){
        let isLoggedIn = rootGetters['session/isLoggedIn']
        if(!isLoggedIn) return dispatch('sayNotLoggedIn', null, { root: true })
        return api.notifications
            .getNotifications(rootState.session.user._id, rootState.session.accessToken, { readed: false })
            .then(response => {
                let data = response.data
                commit('add-unread', data.total)
                return response
            })
    }
}