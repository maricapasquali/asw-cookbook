export default function (bus){
    const options = {
        title: 'Amicizia',
        solid: true
    }

    function friendShipRequest(notification){
        console.debug('friendship request => ', notification)
        this.$bvToast.toast(notification.content, options)
        this.$store.commit('notifications/add-unread')
        this.$store.commit('friendships/add', {
                from: {_id: notification.otherInfo.from },
                to: { _id: notification.user },
                state: "pending"
            })
        if(notification.otherInfo.from) bus.$emit('friendship:request:' + notification.otherInfo.from, notification) /* for b-friendship */
        if(notification.otherInfo.to) bus.$emit('friendship:request:' + notification.otherInfo.to, notification) /* for b-friendship */
        bus.$emit('friendship:request:' + notification.user, notification) // for friend section
    }

    function friendShipRemove({notification, friendship}){
        console.debug('friendship remove => ', {notification, friendship})
        if(notification) {
            this.$bvToast.toast(notification.content, options)
            this.$store.commit('notifications/add-unread')
            this.$store.commit('friendships/remove', notification.otherInfo.exFriend)
            bus.$emit('friendship:remove:' + notification.otherInfo.exFriend, notification) /* for b-friendship */
            bus.$emit('friendship:remove:' + notification.user, notification) // for friend section
        }
        if(friendship) bus.$emit('friend:remove', friendship)
    }

    function friendShipUpdate({notification, friendship}){
        console.debug('friendship update => ', {notification, friendship})
        if(notification) {
            this.$bvToast.toast(notification.content, options)
            this.$store.commit('notifications/add-unread')
            let {state, to} = notification.otherInfo
            this.$store.commit('friendships/update', { friendID: to, updatedFriendship: {state} })
            bus.$emit('friendship:update:' + notification.otherInfo.to, notification)
        }
        if(friendship) bus.$emit('friend:add', friendship)
    }

    return {
        friendShipUpdate,
        friendShipRemove,
        friendShipRequest
    }
}
