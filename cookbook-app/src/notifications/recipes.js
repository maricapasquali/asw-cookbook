import {bus} from "@/main";

const options = {
    title: 'Ricette',
    solid: true
}


function _operationOnRecipe(op, notification, data){
    console.debug('recipe ', op , ' => ', { notification, data })
    if(notification) {
        this.$bvToast.toast(notification.content, options)
        this.$store.commit('addUnReadNotification')
    }
    bus.$emit('recipe:' + op, notification, data)
}

function recipeComment({notification, comment}) {
    this._operationOnRecipe('comment', notification, comment)
}

function createSharedRecipe({notification, recipe}) {
    this._operationOnRecipe('create', notification, recipe)
}

function updateSharedRecipe({notification, recipe}) {
    this._operationOnRecipe('update', notification, recipe)
}

function deleteSharedRecipe({notification, recipe}) {
    this._operationOnRecipe('delete', notification, recipe)
}


function recipeListeners(){
    this.socket.on('recipe:comment', this.recipeComment.bind(this))
    this.socket.on('recipe:create', this.createSharedRecipe.bind(this))
    this.socket.on('recipe:update', this.updateSharedRecipe.bind(this))
    this.socket.on('recipe:delete', this.deleteSharedRecipe.bind(this))
}

export default {
    _operationOnRecipe,
    recipeComment,
    createSharedRecipe,
    updateSharedRecipe,
    deleteSharedRecipe,

    recipeListeners
}