import {bus} from "@/main";

const options = {
    title: 'Amicizia',
    solid: true
}

function friendShipRequest(notification){
    console.debug('friendship request => ', notification)
    this.$bvToast.toast(notification.content, options)
    this.$store.commit('addUnReadNotification')
    bus.$emit('friendship:request:' + notification.user, notification)
}

function friendShipRemove({notification, friendship}){
    console.debug('friendship remove => ', {notification, friendship})
    if(notification) {
        this.$bvToast.toast(notification.content, options)
        this.$store.commit('addUnReadNotification')
        bus.$emit('friendship:remove:' + notification.user, notification)
    }
    if(friendship) bus.$emit('friend:remove', friendship)
}

function friendShipUpdate({notification, friendship}){
    console.debug('friendship update => ', {notification, friendship})
    if(notification) {
        this.$bvToast.toast(notification.content, options)
        this.$store.commit('addUnReadNotification')
        bus.$emit('friendship:update:' + notification.otherInfo.to, notification)
    }
    if(friendship) bus.$emit('friend:add', friendship)
}

function friendShipListeners(){
    this.socket.on('friendship:request', this.friendShipRequest.bind(this))
    this.socket.on('friendship:remove', this.friendShipRemove.bind(this))
    this.socket.on('friendship:update', this.friendShipUpdate.bind(this))
}

export default {
    friendShipRequest,
    friendShipUpdate,
    friendShipRemove,

    friendShipListeners
}