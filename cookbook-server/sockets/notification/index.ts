import * as friendsHandler from './friends'
import * as foodsHandler from './foods'
import * as commentsHandler from './comments'
import * as recipesHandler from './recipes'
import * as likesHandler from './likes'
import * as userInfosHandler from './user-infos'

export default function (io: any, socket: any): void {

    //USER
    socket.on('user:update:password', () => userInfosHandler.password(socket))
    socket.on('user:strike', user => userInfosHandler.strike(socket, user))

    //SHARED RECIPE
    socket.on('recipe:create', recipe => recipesHandler.create(socket, recipe))
    socket.on('recipe:update', recipe => recipesHandler.update(socket, recipe))
    socket.on('recipe:delete', recipe => recipesHandler.erase(socket, recipe))
    socket.on('recipe:comment', (recipe, comment) => recipesHandler.comment(socket, recipe, comment))

    //FOOD
    socket.on('food:create', food => foodsHandler.create(socket, food))

    // LIKE ON RECIPE OR COMMENT
    socket.on('like:recipe', (recipe, like) => likesHandler.recipe(socket, recipe, like))
    socket.on('like:comment', (comment, like) => likesHandler.comment(socket, comment, like))

    // COMMENT
    socket.on('comment:response', (comment, response) => commentsHandler.response(socket, comment, response))
    socket.on('comment:report', (comment, reporter) => commentsHandler.report(socket, comment, reporter))

    // FRIENDS
    socket.on('friendship:request', request => friendsHandler.request(socket, request))
    socket.on('friendship:update', request => friendsHandler.update(socket, request))
    socket.on('friendship:remove', otherUser => friendsHandler.remove(socket, otherUser))

}