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
            .catch(api.notifications.HandlerError.getNotifications)
    },
    getNumberOfUnReadChatsMessages({commit, state}){
        if(state.user && state.accessToken)
            api.chats
               .getChats(state.user._id, state.accessToken, { 'unread-messages' : true })
               .then(({data}) => {
                   console.debug('unread-messages : ', data)
                   let unReadMessages = data.items.reduce((acc, current)=> acc += current.messages.length, 0)
                   console.debug('unread-chat : ', data, ', # unread-messages : ', unReadMessages)
                   if(unReadMessages > 0) commit('addUnReadMessage', unReadMessages)
               })
               .catch(err => console.error(err))
    },
}