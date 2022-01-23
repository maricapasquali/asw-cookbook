import {bus} from "@/main";

const options = {
    title: 'Utente',
    solid: true
}

function afterUpdatePassword(notification){
    console.debug('update password => ', notification)
    this.$bvToast.toast(notification.content, options)
    this.$store.commit('addUnReadNotification')
    bus.$emit('user:update:password', notification)
}

function onAddStrike({notification, strike}){
    console.debug('strike user => ', notification)
    this.$bvToast.toast(notification.content, options)
    bus.$emit('user:strike', notification)
    this.$store.commit('addUnReadNotification')
    if(strike === 3){
        this.$store.commit('endSession')
        this.$router.replace({ name: 'homepage' })
    }
}

function userInfoListeners(){
    this.socket.on('user:update:password', this.afterUpdatePassword.bind(this))
    this.socket.on('user:strike', this.onAddStrike.bind(this))
}

export default {
    afterUpdatePassword,
    onAddStrike,

    userInfoListeners
}