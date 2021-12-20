import {bus} from "@/main";

function friendShipRequest(data){
    console.debug('friendship request => ', data)
    this.$bvToast.toast(data.from.userID + ' vuole essere tuo amico.', this.optionsToastFriendShip)
    bus.$emit('friendship:request', data.from._id)
}

function friendShipRemove(data){
    console.debug('friendship remove => ', data)
    this.$bvToast.toast(data.from.userID + ' ha smesso di seguirti.', this.optionsToastFriendShip)
    bus.$emit('friendship:remove', data.from._id)
}

function friendShipUpdate(data){
    console.debug('friendship update => ', data)
    this.$bvToast.toast(data.to.userID + ' ha ' + (data.state==='accepted' ? 'accettato': 'rifiutato') + ' la tua richiesta.', this.optionsToastFriendShip)
    bus.$emit('friendship:update', {user: data.to._id, state: data.state})
}

function friendShipListeners(){
    this.socket.on('friendship:request:' + this.userIdentifier, this.friendShipRequest.bind(this))
    this.socket.on('friendship:remove:' + this.userIdentifier, this.friendShipRemove.bind(this))
    this.socket.on('friendship:update:' + this.userIdentifier, this.friendShipUpdate.bind(this))
}

export default {
    friendShipRequest,
    friendShipUpdate,
    friendShipRemove,

    friendShipListeners
}