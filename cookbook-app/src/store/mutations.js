import Vue from "vue";

export default {
    startSession(state, session){
        Vue.set(state, 'user', session.user)
        Vue.set(state, 'accessToken', session.access)
        Vue.set(state, 'refreshToken', session.refresh)
        console.log('Start session : ', state)
        localStorage.setItem('user.info', JSON.stringify(session.user))
        localStorage.setItem('token.access', session.access)
        localStorage.setItem('token.refresh',  session.refresh)
    },
    setSession(state){
        Vue.set(state, 'user', JSON.parse(localStorage.getItem('user.info')))
        Vue.set(state, 'accessToken', localStorage.getItem('token.access'))
        Vue.set(state, 'refreshToken', localStorage.getItem('token.refresh'))
        console.log('Set session : ', state)
    },
    endSession(state){
        Vue.set(state, 'user', null)
        Vue.set(state, 'accessToken', null)
        Vue.set(state, 'refreshToken', null)
        console.log('End session : ', state)
        localStorage.removeItem('user.info')
        localStorage.removeItem('token.access')
        localStorage.removeItem('token.refresh')
    },
    changeUserId(state, newUserID){
        if(state.user){
            Vue.set(state.user, 'userID', newUserID)
            console.log('Change userID .')
        }
    },
    setAccessToken(state, newAccessToken) {
        Vue.set(state, 'accessToken', newAccessToken)
        localStorage.setItem('token.access', newAccessToken)
        console.log('Refresh access token .')
    }
}