
export default {

    reported({dispatch, rootState, rootGetters}, payload){
        let {options} = payload || {}
        let isLoggedIn = rootGetters['session/isLoggedIn']
        if(!isLoggedIn) return dispatch('sayNotLoggedIn', null, { root: true })
        return rootState._api.recipes.comments.getReportedComment(rootState.session.accessToken, options)
    },

    remove({dispatch, rootState, rootGetters},  {ownerID, recipeID, commentID }){
        let isLoggedIn = rootGetters['session/isLoggedIn']
        if(!isLoggedIn) return dispatch('sayNotLoggedIn', null, { root: true })
        return rootState._api.recipes.comments.deleteComment(ownerID, recipeID, commentID, rootState.session.accessToken)
    },

    update({dispatch, rootState, rootGetters}, {ownerID, recipeID, commentID, content}){
        let isLoggedIn = rootGetters['session/isLoggedIn']
        if(!isLoggedIn) return dispatch('sayNotLoggedIn', null, { root: true })
        return rootState._api.recipes.comments.updateComment(ownerID, recipeID, commentID, rootState.session.accessToken, { data: { content } })
    },

    ["un-report"]({dispatch, rootState, rootGetters}, {ownerID, recipeID, commentID}){
        let isLoggedIn = rootGetters['session/isLoggedIn']
        if(!isLoggedIn) return dispatch('sayNotLoggedIn', null, { root: true })
        return rootState._api.recipes.comments.updateComment(ownerID, recipeID, commentID, rootState.session.accessToken, {action: 'un-report'})
    },

    response({rootState}, {ownerID, recipeID, commentID, content}){
        return rootState._api.recipes.comments.createResponse(ownerID, recipeID, commentID, {content}, rootState.session.accessToken)
    },

    report({rootState}, {ownerID, recipeID, commentID}){
        return rootState._api.recipes.comments.updateComment(ownerID, recipeID, commentID, rootState.session.accessToken, {action: 'report'})
    },

    create({rootState}, {ownerID, recipeID, content}){
        return rootState._api.recipes.comments.createComment(ownerID, recipeID, {content}, rootState.session.accessToken)
    }
}
