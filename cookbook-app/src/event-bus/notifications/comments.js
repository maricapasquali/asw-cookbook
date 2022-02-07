export default function (bus){

    const options = {
        title: 'Commento',
        solid: true
    }

    function commentResponse({notification, response}){
        console.debug('comment response => ', { notification, response})
        if(notification) {
            this.$bvToast.toast(notification.content, options)
            this.$store.commit('notifications/add-unread')
        }
        bus.$emit('comment:response', notification, response)
    }

    function commentReport(data){
        console.debug('comment report => ', data)
        if(typeof data === 'string'){
            bus.$emit('comment:report', data)
        }else {
            this.$bvToast.toast(data.content, options)
            this.$store.commit('notifications/add-unread')
            bus.$emit('comment:report', data)
        }
    }

    return {
        commentResponse,
        commentReport
    }
}
