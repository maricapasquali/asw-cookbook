
export default {
    signup(context, data) {
        return this.$api.users.signup(data)
    },
    ["check-account"](context, query) {
        return this.$api.users.checkAccount(query)
    },
    ["information-of"]({ rootState }, { userID, options }) {
        return this.$api.users.getUser(userID, rootState.session.accessToken, options)
    },
    ["search-for-username"]({ rootState }, { search, username, options }) {
        return this.$api.users.getUsers({ userID: { search , value: username } }, rootState.session.accessToken, null, options)
    },
    search({ rootState }, { query, pagination, options }) {
        return this.$api.users.getUsers(query,  rootState.session.accessToken, pagination, options)
    },

    ["update-information"]({ dispatch, rootState, rootGetters }, newInfo) {
        let isLoggedIn = rootGetters["session/isLoggedIn"]
        if (!isLoggedIn) return dispatch("sayNotLoggedIn", null, { root: true })
        return this.$api.users.updateUserInfo(rootState.session.user._id, newInfo, rootState.session.accessToken)
    },
    all({ dispatch, rootState, rootGetters }, payload) {
        let { filters, pagination, options } = payload || {}
        let isLoggedIn = rootGetters["session/isLoggedIn"]
        if (!isLoggedIn) return dispatch("sayNotLoggedIn", null, { root: true })
        return this.$api.users.getUsers(filters, rootState.session.accessToken, pagination, options)
    },
    erase({ dispatch, rootState, rootGetters }, userID) {
        let isLoggedIn = rootGetters["session/isLoggedIn"]
        if (!isLoggedIn) return dispatch("sayNotLoggedIn", null, { root: true })
        return this.$api.users.deleteAccount(userID, rootState.session.accessToken)
    },
    ["update-username"]({ dispatch, rootState, rootGetters }, { oldUsername, newUsername }) {
        let isLoggedIn = rootGetters["session/isLoggedIn"]
        if (!isLoggedIn) return dispatch("sayNotLoggedIn", null, { root: true })
        return this.$api.users.changeUserID(rootState.session.user._id, { old_userID: oldUsername, new_userID: newUsername }, rootState.session.accessToken)
    },
    ["update-password"]({ dispatch, rootState, rootGetters }, { oldPassword, newPassword }) {
        let isLoggedIn = rootGetters["session/isLoggedIn"]
        if (!isLoggedIn) return dispatch("sayNotLoggedIn", null, { root: true })
        return this.$api.users.changeOldPassword(rootState.session.user._id, { old_password: oldPassword, new_hash_password: newPassword }, rootState.session.accessToken)
    }
}
