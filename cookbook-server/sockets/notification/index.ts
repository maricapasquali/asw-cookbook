import * as friendsHandler from './friends'
import * as foodsHandler from './foods'
import * as commentsHandler from './comments'
import * as recipesHandler from './recipes'
import * as likesHandler from './likes'
import * as userInfosHandler from './user-infos'

import {checkAuthorization as isAuthorized} from "../users";

export default function (io: any, socket: any): void {

    //USER
    socket.on('user:update:password', () => {
        if(isAuthorized(socket)) userInfosHandler.password(socket)
    })
    socket.on('user:strike', user => {
        if(isAuthorized(socket)) userInfosHandler.strike(socket, user)
    })

    //SHARED RECIPE
    socket.on('recipe:create', recipe => {
        if(isAuthorized(socket)) recipesHandler.create(socket, recipe)
    })
    socket.on('recipe:update', recipe => {
        if(isAuthorized(socket)) recipesHandler.update(socket, recipe)
    })
    socket.on('recipe:delete', recipe => {
        if(isAuthorized(socket)) recipesHandler.erase(socket, recipe)
    })
    socket.on('recipe:comment', (recipe, comment) => recipesHandler.comment(socket, recipe, comment))

    //FOOD
    socket.on('food:create', food => {
        if(isAuthorized(socket)) foodsHandler.create(socket, food)
    })

    // LIKE ON RECIPE OR COMMENT
    socket.on('like:recipe', (recipe, like) => likesHandler.recipe(socket, recipe, like))
    socket.on('like:comment', (comment, like) => likesHandler.comment(socket, comment, like))

    // COMMENT
    socket.on('comment:response', (comment, response) => commentsHandler.response(socket, comment, response))
    socket.on('comment:report', (comment, reporter) => commentsHandler.report(socket, comment, reporter))

    // FRIENDS
    socket.on('friendship:request', request => {
        if(isAuthorized(socket)) friendsHandler.request(socket, request)
    })
    socket.on('friendship:update', request => {
        if(isAuthorized(socket)) friendsHandler.update(socket, request)
    })
    socket.on('friendship:remove', otherUser => {
        if(isAuthorized(socket)) friendsHandler.remove(socket, otherUser)
    })

}
