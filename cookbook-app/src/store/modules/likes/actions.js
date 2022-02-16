import api from '@api'

export default {
    remove({commit, dispatch, state, rootState, rootGetters}, {ownerID, recipeID, likeID, commentID}){
        let isLoggedIn = rootGetters['session/isLoggedIn']
        return api.recipes.likes.unLike(ownerID, recipeID, likeID , rootState.session.accessToken, commentID)
            .then(response => {
                if(!isLoggedIn) {
                    if(commentID) commit('anonymous:remove:like-comment', commentID)
                    else commit('anonymous:remove:like-recipe', recipeID)
                }
                return response
            })
    },

    add({commit, dispatch, state, rootState, rootGetters}, {ownerID, recipeID, commentID}){
        let isLoggedIn = rootGetters['session/isLoggedIn']
        return api.recipes.likes.like(ownerID, recipeID, rootState.session.accessToken, commentID)
            .then(response => {
                if(!isLoggedIn) {
                    if(commentID) commit('anonymous:add:like-comment', commentID)
                    else commit('anonymous:add:like-recipe', recipeID)
                }
                return response
            })
    },

    ['anonymous:is:like-comment']({state}, commentID){
        return state.anonymousLikeOnComment.find(i => i === commentID) !== undefined
    },

    ['anonymous:is:like-recipe']({state}, recipeID){
        return state.anonymousLikeOnRecipe.find(i => i === recipeID) !== undefined
    }
}