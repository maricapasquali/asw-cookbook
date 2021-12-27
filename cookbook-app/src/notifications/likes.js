import {bus} from "@/main";

const options = {
    title: 'Mi piace',
    solid: true
}

function likeRecipe({notification, like}){
    console.debug('like recipe => ', notification)
    if(notification) this.$bvToast.toast(notification.content, options)
    bus.$emit('like:recipe', notification, like)
}

function likeComment({notification, like}){
    console.debug('like comment => ', notification)
    if(notification.content) this.$bvToast.toast(notification.content, options)
    bus.$emit('like:comment', notification, like)
}

function likeListeners(){
    this.socket.on('like:recipe', this.likeRecipe.bind(this))
    this.socket.on('like:comment', this.likeComment.bind(this))
}

export default {
    likeRecipe,
    likeComment,

    likeListeners
}