import {findConnectedUserBy} from "../user";

export default function (io: any, socket: any): void {
    //TODO: add mongoose notification

    //USER
    socket.on('user:update-password', data => {})
    //SHARED RECIPE
    socket.on('recipe:create', data => {})
    socket.on('recipe:update', data => {})
    socket.on('recipe:delete', data => {})
    socket.on('recipe:comment', data => {})
    //FOOD
    socket.on('food:create', data => {})
    // LIKE ON RECIPE OR COMMENT
    socket.on('like:recipe', data => {})
    socket.on('like:comment', data => {})
    // COMMENT
    socket.on('comment:comment', data => {})
    socket.on('comment:report', data => {})

    // FRIENDS
    socket.on('friendship:request', request => {
        let user = findConnectedUserBy('_id', request.to._id)
        if(user.info) {
            console.log('Request = ', request)
            socket.to(user.info.socketID).emit('friendship:request:' + request.to._id, request)
        } else console.log(request.to._id + ' not online.')
    })

    socket.on('friendship:update', request => {
        let user = findConnectedUserBy('_id', request.from._id)
        if(user.info) {
            console.log('Request update = ', request)
            socket.to(user.info.socketID).emit('friendship:update:' + request.from._id, request)
        } else console.log(request.from._id + ' not online.')
    })

    socket.on('friendship:remove', (id, fromId) => {
        let toUser = findConnectedUserBy('_id', id)
        if(toUser.info) {
            let fromUser = findConnectedUserBy('_id', fromId)
            console.log('Remove friend = ', id)
            socket.to(toUser.info.socketID).emit('friendship:remove:' + id, {from: fromUser.info.user, to: toUser.info.user })
        } else console.log(id +' not online.')
    })

}