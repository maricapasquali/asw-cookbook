export default function (bus){
    const options = {
        title: 'Utente',
        solid: true
    }

    function afterUpdatePassword(notification){
        console.debug('update password => ', notification)
        this.$bvToast.toast(notification.content, options)
        this.$store.commit('notifications/add-unread')
        bus.$emit('user:update:password', notification)
    }

    function onAddStrike({notification, strike}){
        console.debug('strike user => ', notification)
        this.$bvToast.toast(notification.content, options)
        bus.$emit('user:strike', notification)
        this.$store.commit('notifications/add-unread')
        if(strike === 3){
            this.$store.dispatch('reset')
            this.$router.replace({ name: 'homepage' })
        }
    }

    return {
        afterUpdatePassword,
        onAddStrike
    }
}
