import actions from "./actions";
import mutations from "./mutations";
import getters from "./getters";

import messages from './modules/messages'

export default {
    namespaced: true,
    modules: {
      messages
    },
    state:{
        unreadMessages: 0,
    },
    getters,
    mutations,
    actions,
}