import notificationsController from "./controllers/notifications"
import messagesController from "./controllers/messages"
import updatesController from "./controllers/updates"

import {socketIO} from "@services/socket";

export default function installSocket(Vue, {bus, store, router}) {

    const notificController = notificationsController(bus, store, router)
    const mexController = messagesController(bus, store, socketIO)
    const updController = updatesController(bus, store, router)


    socketIO.on('friendship:request', notificController.friendShipRequest.bind(this))
    socketIO.on('friendship:update', notificController.friendShipUpdate.bind(this))
    socketIO.on('friendship:remove', notificController.friendShipRemove.bind(this))

    socketIO.on('food:create', notificController.foodCreate.bind(this))
    socketIO.on('food:update', updController.updateFood.bind(this))

    socketIO.on('shopping-list:add', updController.addInShoppingList.bind(this))
    socketIO.on('shopping-list:update', updController.updatePointInShoppingList.bind(this))
    socketIO.on('shopping-list:remove', updController.removePointInShoppingList.bind(this))


    socketIO.on('comment:response', notificController.commentResponse.bind(this))
    socketIO.on('comment:report', notificController.commentReport.bind(this))
    socketIO.on('comment:update', updController.updateComment.bind(this))
    socketIO.on('comment:delete', updController.deleteComment.bind(this))
    socketIO.on('comment:unreport', updController.unReportComment.bind(this))

    socketIO.on('like:recipe', notificController.likeRecipe.bind(this))
    socketIO.on('like:comment', notificController.likeComment.bind(this))
    socketIO.on('unlike:recipe', updController.unlikeRecipe.bind(this))
    socketIO.on('unlike:comment', updController.unlikeComment.bind(this))

    socketIO.on('recipe:comment', notificController.recipeComment.bind(this))
    socketIO.on('recipe:create', notificController.createSharedRecipe.bind(this))
    socketIO.on('recipe:create:saved', notificController.createSavedRecipe.bind(this))
    socketIO.on('recipe:update', notificController.updateSharedRecipe.bind(this))
    socketIO.on('recipe:delete', notificController.deleteSharedRecipe.bind(this))

    socketIO.on('recipe:add:permission', updController.addRecipePermission.bind(this))

    socketIO.on('user:update:password', notificController.afterUpdatePassword.bind(this))
    socketIO.on('user:strike', notificController.onAddStrike.bind(this))

    socketIO.on('user:signup', updController.signupUser.bind(this))
    socketIO.on('user:checked', updController.checkUser.bind(this))
    socketIO.on('user:update:info', updController.updateInfoUser.bind(this))
    socketIO.on('user:delete', updController.deleteUser.bind(this))

    socketIO.on('all:users:online', users => store.commit('users/set-onlines', users))
    socketIO.on('user:online', _id => store.commit('users/add-online', _id))
    socketIO.on('user:offline', (_id, _date) => store.commit('users/remove-online', {_id, _date}))

    socketIO.on('push-messages', mexController.pushMessages.bind(this))
    socketIO.on('read-messages', mexController.readMessages.bind(this))

    socketIO.on('chat:change:role:ok', (chatID, userRole) => bus.$emit('chat:change:role', chatID, userRole))

    socketIO.on('operation:not:authorized', ({ expired, message }) => bus.$emit(expired ? 'show:error:unauthenticated' : 'show:error:forbidden', {message}))

    socketIO.on('logout', () => {
        console.debug("Logout ok.")
        store.dispatch('reset')
        router.replace({name: 'homepage'})
    })

    socketIO.on('connect_error', error => {
        if(error.data){
            let expired = error.data.expired
            let message = error.message
            console.error("connect_error : message: ", message, ", expired ", expired)
            bus.$emit(expired ? 'show:error:unauthenticated' : 'show:error:forbidden', {message})
        }
    })

    Vue.prototype.$socket = socketIO

    console.debug('Install plugin socket ...')
}
