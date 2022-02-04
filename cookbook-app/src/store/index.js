import Vue from "vue";
import Vuex from "vuex"

import getters from './getters.js'
import mutations from './mutations.js'
import actions from './actions.js'

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        unreadNotifications: 0,
        unreadMessages: 0,

        logoutOn: false,

        requestError: {
            serverError: {
                show: false,
                message: ''
            },
            badRequestError: {
                show: false,
                message: ''
            },
            unAuthenticatedError: {
                show: false,
                _forbiddenPage: false
            },
            forbiddenError: {
                show: false,
                message: ''
            },
            notFoundResource: {
                show: false,
                resource: {}
            }
        }
    },
    getters,
    mutations,
    actions
})