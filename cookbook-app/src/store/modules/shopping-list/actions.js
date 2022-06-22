

export default {
    get({ commit, dispatch, rootState, rootGetters }) {
        let isLoggedIn = rootGetters["session/isLoggedIn"]
        if (!isLoggedIn) return dispatch("sayNotLoggedIn", null, { root: true })
        return this.$api.shoppingList.getShoppingList(rootState.session.user._id, rootState.session.accessToken)
            .then(response => {
                commit("set", response.data)
                return response
            })
    },
    ["add-point"]({ commit, dispatch, rootState, rootGetters }, foodID) {
        let isLoggedIn = rootGetters["session/isLoggedIn"]
        if (!isLoggedIn) return dispatch("sayNotLoggedIn", null, { root: true })
        return this.$api.shoppingList.createShoppingListPoint(rootState.session.user._id, { food: foodID, checked: false }, rootState.session.accessToken)
            .then(response => {
                let point = response.data
                commit("add", point)
                return response
            })
    },
    ["update-point"]({ commit, dispatch, rootState, rootGetters }, { pointID, checked }) {
        let isLoggedIn = rootGetters["session/isLoggedIn"]
        if (!isLoggedIn) return dispatch("sayNotLoggedIn", null, { root: true })
        return this.$api.shoppingList.updateShoppingListPoint(rootState.session.user._id, pointID, { checked } , rootState.session.accessToken)
            .then(response => {
                commit("update", { pointID, checked })
                return response
            })
    },
    ["remove-point"]({ commit, dispatch, rootState, rootGetters }, pointID) {
        let isLoggedIn = rootGetters["session/isLoggedIn"]
        if (!isLoggedIn) return dispatch("sayNotLoggedIn", null, { root: true })
        return this.$api.shoppingList.deleteShoppingListPoint(rootState.session.user._id, pointID, rootState.session.accessToken)
            .then(response => {
                commit("remove", pointID)
                return response
            })
    }
}