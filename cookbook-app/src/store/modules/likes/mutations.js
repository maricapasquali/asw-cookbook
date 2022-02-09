import Vue from "vue";

export default {
    ['anonymous:add:like-comment'](state, commentID){
        Vue.set(state.anonymousLikeOnComment, 0, commentID)
    },

    ['anonymous:add:like-recipe'](state, recipeID){
        Vue.set(state.anonymousLikeOnRecipe, 0, recipeID)
    },

    ['anonymous:remove:like-comment'](state, commentID){
        let recipeIndex = state.anonymousLikeOnComment.findIndex(r => r === commentID)
        if(recipeIndex !== -1) state.anonymousLikeOnComment.splice(recipeIndex, 1)
    },

    ['anonymous:remove:like-recipe'](state, recipeID){
        let recipeIndex = state.anonymousLikeOnRecipe.findIndex(r => r === recipeID)
        if(recipeIndex !== -1) state.anonymousLikeOnRecipe.splice(recipeIndex, 1)
    }
}