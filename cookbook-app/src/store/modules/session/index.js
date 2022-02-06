import getters from './getters'
import mutations from './mutations'
import actions from './actions'

export default {
    state: {
        unreadNotifications: 0,
        unreadMessages: 0,
    },
    getters,
    mutations,
    actions
}