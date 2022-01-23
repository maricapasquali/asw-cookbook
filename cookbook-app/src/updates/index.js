import { bus } from '@/main'


function updateListeners(){

    this.socket.on('unlike:recipe', ({recipeID, likeID}) => bus.$emit('unlike:recipe', recipeID, likeID))
    this.socket.on('unlike:comment', ({commentID, likeID}) => bus.$emit('unlike:comment', commentID, likeID))

    this.socket.on('food:update', food => bus.$emit('food:update', food))

    this.socket.on('comment:update', comment => bus.$emit('comment:update', comment))
    this.socket.on('comment:delete', commentID => bus.$emit('comment:delete', commentID))
    this.socket.on('comment:unreport', commentID => bus.$emit('comment:unreport', commentID))

    this.socket.on('user:signup', user => bus.$emit('user:signup', user))
    this.socket.on('user:checked', user => bus.$emit('user:checked', user))


    this.socket.on('user:update:info', user_info => bus.$emit('user:update:info', user_info))
    this.socket.on('user:delete', id => bus.$emit('user:delete', id))
}

export default {
    updateListeners
}