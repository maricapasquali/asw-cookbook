import actions from "./actions";

import resetPassword from './modules/reset-password'

export default {
    namespaced: true,
    modules:{
        'reset-password': resetPassword
    },
    actions
}