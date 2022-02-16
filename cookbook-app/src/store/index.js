import Vue from "vue";
import Vuex from "vuex"

import session from './modules/session'
import notifications from './modules/notifications'
import foods from './modules/foods'
import likes from './modules/likes'
import comments from './modules/comments'
import recipes from './modules/recipes'
import shoppingList from './modules/shopping-list'
import friends from './modules/friends'
import users from './modules/users'
import chats from './modules/chats'

import actions from './actions'
import getters from './getters'

import app from '~/app'

Vue.use(Vuex)

export default new Vuex.Store({
    modules: {
        session,
        notifications,
        foods,
        likes,
        comments,
        recipes,
        'shopping-list': shoppingList,
        friendships: friends,
        users,
        chats
    },
    state: {
        _genders: app.Genders,
        _countries: app.Countries,
        _diets: app.Diets,
        _recipeCategories: app.RecipeCategories,

        language: 'it'
    },
    getters,
    actions
})
