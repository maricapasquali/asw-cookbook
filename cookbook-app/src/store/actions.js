import api from '@api'
export default {
    getNumberOfUnReadNotifications({commit, state}){
        if(state.user && state.accessToken)
         api.notifications
            .getNotifications(state.user._id, state.accessToken, { readed: false })
            .then(({data}) => {
                console.debug('unread-notification : ', data)
                commit('addUnReadNotification', data.total)
            })
            .catch(err => console.error(err))
    },
}