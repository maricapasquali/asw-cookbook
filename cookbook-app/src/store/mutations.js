import Vue from "vue";

import socket, {setSocket} from "../services/socket";

function _setSocket(state){
    setSocket({
        key: state.accessToken,
        userinfo: state.user ? { _id: state.user._id , userID: state.user.userID, isAdmin: state.user.isAdmin } : undefined
    })
    Vue.set(state, 'socket', socket)
    console.log('Set Socket.')
}

export default {
    _setSocket,

    startSession(state, session){
        Vue.set(state, 'user', session.user)
        Vue.set(state, 'accessToken', session.access)
        Vue.set(state, 'refreshToken', session.refresh)
        console.log('Start session : ', state)
        _setSocket(state)
        localStorage.setItem('user.info', JSON.stringify(session.user))
        localStorage.setItem('token.access', session.access)
        localStorage.setItem('token.refresh',  session.refresh)
    },
    setSession: function (state){
        Vue.set(state, 'user', JSON.parse(localStorage.getItem('user.info')))
        Vue.set(state, 'accessToken', localStorage.getItem('token.access'))
        Vue.set(state, 'refreshToken', localStorage.getItem('token.refresh'))
        _setSocket(state)
        console.log('Set session : ', state)
    },
    endSession(state){
        Vue.set(state, 'user', null)
        Vue.set(state, 'accessToken', null)
        Vue.set(state, 'refreshToken', null)
        console.log('End session : ', state)
        _setSocket(state)
        localStorage.removeItem('user.info')
        localStorage.removeItem('token.access')
        localStorage.removeItem('token.refresh')

        Vue.set(state, 'unreadNotifications', 0)
        Vue.set(state, 'unreadMessages', 0)
    },
    changeUserId(state, newUserID){
        if(state.user){
            Vue.set(state.user, 'userID', newUserID)
            console.log('Change userID .')
            _setSocket(state)
        }
    },
    setAccessToken(state, newAccessToken) {
        Vue.set(state, 'accessToken', newAccessToken)
        localStorage.setItem('token.access', newAccessToken)
        console.log('Refresh access token .')
        _setSocket(state)
    },
    addUnReadNotification(state, num){
        if(num) Vue.set(state, 'unreadNotifications', num)
        else Vue.set(state, 'unreadNotifications', state.unreadNotifications + 1)
    },
    removeUnReadNotification(state){
        if(state.unreadNotifications > 0)
            Vue.set(state, 'unreadNotifications', state.unreadNotifications - 1)
    },
    addUnReadMessage(state, num){
        if(num) Vue.set(state, 'unreadMessages', num)
        else Vue.set(state, 'unreadMessages', state.unreadMessages + 1)
    },
    removeUnReadMessage(state){
        if(state.unreadMessages > 0)
            Vue.set(state, 'unreadMessages', state.unreadMessages - 1)
    }
}