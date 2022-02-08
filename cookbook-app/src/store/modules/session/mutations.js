import Vue from "vue";

export default {

    set(state, session){
        const _set = (_session) => {
            Vue.set(state, 'user', _session.user)
            Vue.set(state, 'accessToken', _session.access)
            Vue.set(state, 'refreshToken', _session.refresh)
            console.log('Set session : ', state)
        }
        if(session){
            _set(session)
            localStorage.setItem('user.info', JSON.stringify(session.user))
            localStorage.setItem('token.access', session.access)
            localStorage.setItem('token.refresh',  session.refresh)
        } else {
            _set({
                user: JSON.parse(localStorage.getItem('user.info')),
                access: localStorage.getItem('token.access'),
                refresh: localStorage.getItem('token.refresh')
            })
        }
    },
    end(state){
        Vue.set(state, 'user', null)
        Vue.set(state, 'accessToken', null)
        Vue.set(state, 'refreshToken', null)
        console.log('End session : ', state)

        localStorage.removeItem('user.info')
        localStorage.removeItem('token.access')
        localStorage.removeItem('token.refresh')
    },
    ['change-username'](state, newUserID){
        if(state.user){
            Vue.set(state.user, 'userID', newUserID)
            localStorage.setItem('user.info', JSON.stringify(state.user))
            console.log('Change userID .')
        }
    },
    ['set-access-token'](state, newAccessToken) {
        Vue.set(state, 'accessToken', newAccessToken)
        localStorage.setItem('token.access', newAccessToken)
        console.log('Refresh access token .')
    }
}