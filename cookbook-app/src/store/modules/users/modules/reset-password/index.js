import actions from "./actions";
import getters from "./getters";
import mutations from "./mutations";

export default {
    namespaced: true,
    state: {
        resetPassword: {
            _temporaryAccessToken: '',
            _temporaryUserIdentifier: ''
        }
    },
    getters,
    mutations,
    actions
}