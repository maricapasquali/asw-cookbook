import {bus} from '@/main'

const options = {
    title: 'Commento',
    solid: true
}

function commentResponse({notification, response}){
    console.debug('comment response => ', { notification, response})
    if(notification) this.$bvToast.toast(notification.content, options)
    bus.$emit('comment:response', notification, response)
}

function commentReport(data){
    console.debug('comment report => ', data)
    if(typeof data === 'string'){
        bus.$emit('comment:report', data)
    }else {
        this.$bvToast.toast(data.content, options)
        bus.$emit('comment:report', data)
    }
}

function commentListeners(){
    this.socket.on('comment:response', this.commentResponse.bind(this))
    this.socket.on('comment:report', this.commentReport.bind(this))
}

export default {
    commentResponse,
    commentReport,

    commentListeners
}