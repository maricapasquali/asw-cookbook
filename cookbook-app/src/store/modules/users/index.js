import actions from "./actions"
import mutations from "./mutations"
import getters from "./getters"

import resetPassword from "./modules/reset-password"

export default {
    namespaced: true,
    modules:{
        "reset-password": resetPassword,
    },
    state: {
        _onlines: [],
        _offline: {}
    },
    actions,
    mutations,
    getters
}
