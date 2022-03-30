export default function (bus){

    const options = {
        title: 'Cibo',
        solid: true
    }

    function foodCreate(notification){
        console.debug('food create => ', notification)
        if(notification) {
            this.$bvToast.toast(notification.content, options)
            this.$store.commit('notifications/add-unread')
        }
        bus.$emit('food:create', notification)
    }

    return {
        foodCreate
    }
}