import Vue from "vue"

export default  {
    ["add-unread"](state, num) {
        if (!isDefined(num)) Vue.set(state, "unreadNotifications", state.unreadNotifications + 1)
        else if (num >= 0) Vue.set(state, "unreadNotifications", num)
    },
    ["remove-unread"](state) {
        if (state.unreadNotifications > 0) Vue.set(state, "unreadNotifications", state.unreadNotifications - 1)
    },
    reset(state) {
        Vue.set(state, "unreadNotifications", 0)
    }
}
