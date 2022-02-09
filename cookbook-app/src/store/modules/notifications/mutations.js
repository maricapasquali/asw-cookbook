import Vue from "vue";

export default  {
    ['add-unread'](state, num){
        if(num) Vue.set(state, 'unreadNotifications', num)
        else Vue.set(state, 'unreadNotifications', state.unreadNotifications + 1)
    },
    ['remove-unread'](state){
        if(state.unreadNotifications > 0) Vue.set(state, 'unreadNotifications', state.unreadNotifications - 1)
    },
    reset(state) {
        Vue.set(state, 'unreadNotifications', 0)
    }
}