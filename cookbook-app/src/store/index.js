import Vue from "vue";
import Vuex from "vuex"

import session from './modules/session'
import notifications from './modules/notifications'
import foods from './modules/foods'
import likes from './modules/likes'
import comments from './modules/comments'
import recipes from './modules/recipes'
import shoppingList from './modules/shopping-list'

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
        'shopping-list': shoppingList
    },
    state: {
        _genders: app.Genders,
        _countries: app.Countries,
        _diets: app.Diets,
        _recipeCategories: app.RecipeCategories,
    },
    getters,
    actions
})