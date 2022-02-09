import api from '@api'

export default {
    ['all-shared']({ rootState }, { pagination }){
        return api.recipes.allSharedRecipes(rootState.session.accessToken, pagination)
    },

    ['one-shared']({ rootState }, { ownerID, recipeID }){
        return api.recipes.getRecipe(ownerID, recipeID, 'shared', rootState.session.accessToken)
    },

    ['all-shared-for-user']({ rootState }, { ownerID, pagination }){
        return api.recipes.getRecipes(ownerID, rootState.session.accessToken, 'shared', pagination)
    },

    ['number-for-country']({ rootState }){
        return api.recipes.numberRecipesForCountry(rootState.session.accessToken)
    },

    ['search-in-shared']({ rootState }, { pagination, filters }){
       return api.recipes.allSharedRecipes(rootState.session.accessToken, pagination, filters)
    },

    all({ dispatch, rootState, rootGetters }, { pagination, type }){
        let isLoggedIn = rootGetters['session/isLoggedIn']
        if(!isLoggedIn) return dispatch('sayNotLoggedIn', null, { root: true })
        return api.recipes.getRecipes(rootState.session.user._id, rootState.session.accessToken, type, pagination)
    },

    one({ dispatch, rootState, rootGetters }, recipeID){
        let isLoggedIn = rootGetters['session/isLoggedIn']
        if(!isLoggedIn) return dispatch('sayNotLoggedIn', null, { root: true })
        return api.recipes.getRecipe(rootState.session.user._id, recipeID, null, rootState.session.accessToken)
    },

    ['search-in-all']({ dispatch, rootState, rootGetters }, { pagination, filters, type }){
        let isLoggedIn = rootGetters['session/isLoggedIn']
        if(!isLoggedIn) return dispatch('sayNotLoggedIn', null, { root: true })
        return api.recipes.getRecipes(rootState.session.user._id, rootState.session.accessToken, type, pagination, filters)
    },

    remove({ dispatch, rootState, rootGetters }, recipeID){
        let isLoggedIn = rootGetters['session/isLoggedIn']
        if(!isLoggedIn) return dispatch('sayNotLoggedIn', null, { root: true })
        return api.recipes.deleteRecipe(rootState.session.user._id, recipeID, rootState.session.accessToken)
    },

    create({ dispatch, rootState, rootGetters }, body){
        let isLoggedIn = rootGetters['session/isLoggedIn']
        if(!isLoggedIn) return dispatch('sayNotLoggedIn', null, { root: true })
        return api.recipes.createRecipe(rootState.session.user._id, body,  rootState.session.accessToken)
    },

    update({ dispatch, rootState, rootGetters }, {_id, body}){
        let isLoggedIn = rootGetters['session/isLoggedIn']
        if(!isLoggedIn) return dispatch('sayNotLoggedIn', null, { root: true })
        return api.recipes.updateRecipe(rootState.session.user._id, _id, body, rootState.session.accessToken)
    },

    saved({ dispatch, rootState, rootGetters }){
        let isLoggedIn = rootGetters['session/isLoggedIn']
        if(!isLoggedIn) return dispatch('sayNotLoggedIn', null, { root: true })
        return api.recipes.getRecipes(rootState.session.user._id, rootState.session.accessToken, 'saved')
    },

    ['update-permission']({dispatch, rootState, rootGetters}, {recipeID, permission}){
        let isLoggedIn = rootGetters['session/isLoggedIn']
        if(!isLoggedIn) return dispatch('sayNotLoggedIn', null, { root: true })
        return api.recipes.updatePermission(rootState.session.user._id, recipeID, permission, rootState.session.accessToken)
    }
}