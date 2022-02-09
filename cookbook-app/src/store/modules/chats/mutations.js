import Vue from "vue";

export default {
    ['add-unread'](state, num){
        if(num) Vue.set(state, 'unreadMessages', num)
        else Vue.set(state, 'unreadMessages', state.unreadMessages + 1)
    },
    ['remove-unread'](state){
        if(state.unreadMessages > 0) Vue.set(state, 'unreadMessages', state.unreadMessages - 1)
    },
    reset(state){
        Vue.set(state, 'unreadMessages', 0)
    }
}