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

import assets from './modules/assets'

import actions from './actions'
import getters from './getters'
import createApiPluginStore from './plugins/api'

Vue.use(Vuex)

export default function (envConfiguration){
    return new Vuex.Store({
        modules: {
            assets,

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
            language: 'it'
        },
        getters,
        actions,
        plugins: [createApiPluginStore(envConfiguration.server)]
    })
}
