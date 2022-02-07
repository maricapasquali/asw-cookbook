import Vue from "vue";
import Vuex from "vuex"

import session from './modules/session'
import notifications from './modules/notifications'
import foods from './modules/foods'
import likes from './modules/likes'

import actions from './actions'
import getters from './getters'

import app from '~/app'

Vue.use(Vuex)

export default new Vuex.Store({
    modules: {
        session,
        notifications,
        foods,
        likes
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