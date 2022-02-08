import api from '@api'
export default {
    signup({}, data){
        return api.users.signup(data)
    },
    ['check-account']({}, query){
      return api.users.checkAccount(query)
    },
    ['information-of']({rootState}, userID){
        return api.users.getUser(userID, rootState.session.accessToken)
    },
    ['search-for-username']({rootState}, {search, username}){
        return api.users.getUsers({ userID: { search , value: username } }, rootState.session.accessToken)
    },

    ['update-information']({dispatch, rootState, rootGetters}, newInfo){
        let isLoggedIn = rootGetters['session/isLoggedIn']
        if(!isLoggedIn) return dispatch('sayNotLoggedIn', null, { root: true })
        return api.users.updateUserInfo(rootState.session.user._id, newInfo, rootState.session.accessToken)
    },
    all({dispatch, rootState, rootGetters}, payload){
        let {filters, pagination} = payload || {}
        let isLoggedIn = rootGetters['session/isLoggedIn']
        if(!isLoggedIn) return dispatch('sayNotLoggedIn', null, { root: true })
        return api.users.getUsers(filters, rootState.session.accessToken, pagination)
    },
    erase({dispatch, rootState, rootGetters}, userID){
        let isLoggedIn = rootGetters['session/isLoggedIn']
        if(!isLoggedIn) return dispatch('sayNotLoggedIn', null, { root: true })
        return api.users.deleteAccount(userID, rootState.session.accessToken)
    },
    ['update-username']({dispatch, rootState, rootGetters}, {oldUsername, newUsername}){
        let isLoggedIn = rootGetters['session/isLoggedIn']
        if(!isLoggedIn) return dispatch('sayNotLoggedIn', null, { root: true })
        return api.users.changeUserID(rootState.session.user._id, { old_userID: oldUsername, new_userID: newUsername }, rootState.session.accessToken)
    },
    ['update-password']({dispatch, rootState, rootGetters}, {oldPassword, newPassword}){
        let isLoggedIn = rootGetters['session/isLoggedIn']
        if(!isLoggedIn) return dispatch('sayNotLoggedIn', null, { root: true })
        return api.users.changeOldPassword(rootState.session.user._id, { old_password: oldPassword, new_hash_password: newPassword }, rootState.session.accessToken)
    }
}