import api from "@api"
import {mapping} from "@api/users/friends/utils";

export default {
    of({rootState}, {userID, state, pagination}){
       return api.friends.getFriendOf(userID, rootState.session.accessToken, {state}, pagination)
           .then(response =>{
               response.data.items = response.data.items.map(f => mapping(f, userID))
               return response
           })
    },
    own({ commit, dispatch, rootState, rootGetters}, payload){
        let { userID, state, pagination } = payload || {}
        let isLoggedIn = rootGetters['session/isLoggedIn']
        if(!isLoggedIn) return dispatch('sayNotLoggedIn', null, { root: true })
        return api.friends.getFriendOf(rootState.session.user._id, rootState.session.accessToken,{ userID, state }, pagination)
            .then(response =>{
                commit('set', response.data.items)
                response.data.items = response.data.items.map(f => mapping(f, rootState.session.user._id))
                return response
            })
    },
    ['request-to']({ commit, dispatch, rootState, rootGetters}, userID){
        let isLoggedIn = rootGetters['session/isLoggedIn']
        if(!isLoggedIn) return dispatch('sayNotLoggedIn', null, { root: true })
        return api.friends.requestFriendShip(userID, rootState.session.accessToken)
            .then(response => {
                commit('add', response.data)
                console.debug('ADD REQUEST FRIENDSHIP  ', rootState.friendships._friends)
                return response
            })
    },
    ['break-up-with']({commit, dispatch, rootState, rootGetters}, userID){
        let isLoggedIn = rootGetters['session/isLoggedIn']
        if(!isLoggedIn) return dispatch('sayNotLoggedIn', null, { root: true })
        return api.friends.breakFriendShip(rootState.session.user._id, userID, rootState.session.accessToken)
            .then(response => {
                commit('remove', userID)
                console.debug('BREAK FRIENDSHIP  ', rootState.friendships._friends)
                return response
            })
    },
    ['update-request']({commit, dispatch, rootState, rootGetters}, {userID, state}){
        let isLoggedIn = rootGetters['session/isLoggedIn']
        if(!isLoggedIn) return dispatch('sayNotLoggedIn', null, { root: true })
        return api.friends.updateFriendShip(rootState.session.user._id, userID,{ state }, rootState.session.accessToken)
            .then(response => {
                commit('update', {friendID: userID, updatedFriendship: response.data})
                console.debug('UPDATE REQUEST FRIENDSHIP  ', rootState.friendships._friends)
                return response
            })
    }
}