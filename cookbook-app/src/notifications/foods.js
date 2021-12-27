import {bus} from "@/main";

const options = {
    title: 'Cibo',
    solid: true
}

function foodCreate(notification){
    console.debug('food create => ', notification)
    if(notification) this.$bvToast.toast(notification.content, options)
    bus.$emit('food:create', notification)
}

function foodListeners(){
    this.socket.on('food:create', this.foodCreate.bind(this))
}

export default {
    foodCreate,

    foodListeners
}