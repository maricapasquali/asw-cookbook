

export default {
    ["all-shared"]({ rootState }, { pagination, options }) {
        return this.$api.recipes.allSharedRecipes(rootState.session.accessToken, pagination, null, options)
    },

    ["one-shared"]({ rootState }, { ownerID, recipeID, options }) {
        return this.$api.recipes.getRecipe(ownerID, recipeID, "shared", rootState.session.accessToken, options)
    },

    ["all-shared-for-user"]({ rootState }, { ownerID, pagination, options }) {
        return this.$api.recipes.getRecipes(ownerID, rootState.session.accessToken, "shared", pagination, null, options)
    },

    ["number-for-country"]({ rootState }, payload) {
        let { options } = payload || {}
        return this.$api.recipes.numberRecipesForCountry(rootState.session.accessToken, options)
    },

    ["search-in-shared"]({ rootState }, { pagination, filters, options }) {
        return this.$api.recipes.allSharedRecipes(rootState.session.accessToken, pagination, filters, options)
    },

    all({ dispatch, rootState, rootGetters }, { pagination, type, options }) {
        let isLoggedIn = rootGetters["session/isLoggedIn"]
        if (!isLoggedIn) return dispatch("sayNotLoggedIn", null, { root: true })
        return this.$api.recipes.getRecipes(rootState.session.user._id, rootState.session.accessToken, type, pagination, null, options)
    },

    one({ dispatch, rootState, rootGetters }, { recipeID, options }) {
        let isLoggedIn = rootGetters["session/isLoggedIn"]
        if (!isLoggedIn) return dispatch("sayNotLoggedIn", null, { root: true })
        return this.$api.recipes.getRecipe(rootState.session.user._id, recipeID, null, rootState.session.accessToken, options)
    },

    ["search-in-all"]({ dispatch, rootState, rootGetters }, { pagination, filters, type, options }) {
        let isLoggedIn = rootGetters["session/isLoggedIn"]
        if (!isLoggedIn) return dispatch("sayNotLoggedIn", null, { root: true })
        return this.$api.recipes.getRecipes(rootState.session.user._id, rootState.session.accessToken, type, pagination, filters, options)
    },

    remove({ dispatch, rootState, rootGetters }, recipeID) {
        let isLoggedIn = rootGetters["session/isLoggedIn"]
        if (!isLoggedIn) return dispatch("sayNotLoggedIn", null, { root: true })
        return this.$api.recipes.deleteRecipe(rootState.session.user._id, recipeID, rootState.session.accessToken)
    },

    create({ dispatch, rootState, rootGetters }, body) {
        let isLoggedIn = rootGetters["session/isLoggedIn"]
        if (!isLoggedIn) return dispatch("sayNotLoggedIn", null, { root: true })
        return this.$api.recipes.createRecipe(rootState.session.user._id, body,  rootState.session.accessToken)
    },

    update({ dispatch, rootState, rootGetters }, { _id, body }) {
        let isLoggedIn = rootGetters["session/isLoggedIn"]
        if (!isLoggedIn) return dispatch("sayNotLoggedIn", null, { root: true })
        return this.$api.recipes.updateRecipe(rootState.session.user._id, _id, body, rootState.session.accessToken)
    },

    saved({ dispatch, rootState, rootGetters }, payload) {
        let { options } = payload || {}
        let isLoggedIn = rootGetters["session/isLoggedIn"]
        if (!isLoggedIn) return dispatch("sayNotLoggedIn", null, { root: true })
        return this.$api.recipes.getRecipes(rootState.session.user._id, rootState.session.accessToken, "saved", null, null, options)
    },

    ["update-permission"]({ dispatch, rootState, rootGetters }, { recipeID, permission }) {
        let isLoggedIn = rootGetters["session/isLoggedIn"]
        if (!isLoggedIn) return dispatch("sayNotLoggedIn", null, { root: true })
        return this.$api.recipes.updatePermission(rootState.session.user._id, recipeID, permission, rootState.session.accessToken)
    }
}
