export default function (bus, store){

    const options = {
        title: 'Cibo',
        solid: true
    }

    function foodCreate(notification){
        console.debug('food create => ', notification)
        if(notification) {
            bus.$emit('show:bv-toast', { message: notification.content, options })
            store.commit('notifications/add-unread')
        }
        bus.$emit('food:create', notification)
    }

    return {
        foodCreate
    }
}