import * as friendsHandler from './friends'
import * as foodsHandler from './foods'
import * as commentsHandler from './comments'
import * as recipesHandler from './recipes'
import * as likesHandler from './likes'
import * as userInfosHandler from './user-infos'

import {userInformation} from "../rooms/user";
import {containInAdminsRoom} from "../rooms";
import {checkAuthorization as isAuthorized} from "../rooms/user";

export default function (io: any, socket: any): void {

    let userInfo = userInformation(socket)
    //USER
    socket.on('user:update:password', () => {
        if(isAuthorized(socket)) userInfosHandler.password(io, userInfo.id)
    })
    socket.on('user:strike', user => {
        if(isAuthorized(socket) && containInAdminsRoom(io, socket)) {
            console.log('Add strike => User :', userInfo.name)
            userInfosHandler.strike(io, user)
        }
    })

    //SHARED RECIPE
    socket.on('recipe:create', recipe => {
        if(isAuthorized(socket)) recipesHandler.create(io, recipe)
    })
    socket.on('recipe:update', recipe => {
        if(isAuthorized(socket)) recipesHandler.update(io, userInfo, recipe)
    })
    socket.on('recipe:delete', recipe => {
        if(isAuthorized(socket)) recipesHandler.erase(io, userInfo, recipe)
    })
    socket.on('recipe:comment', (recipe, comment) => recipesHandler.comment(io, recipe, comment))

    //FOOD
    socket.on('food:create', food => {
        if(isAuthorized(socket)) foodsHandler.create(io, userInfo, food)
    })

    // LIKE ON RECIPE OR COMMENT
    socket.on('like:recipe', (recipe, like) => likesHandler.recipe(io, recipe, like))
    socket.on('like:comment', (comment, like) => likesHandler.comment(io, comment, like))

    // COMMENT
    socket.on('comment:response', (comment, response) => commentsHandler.response(io, comment, response))
    socket.on('comment:report', (comment, reporter) => commentsHandler.report(io, comment, reporter))

    // FRIENDS
    socket.on('friendship:request', request => {
        if(isAuthorized(socket)) friendsHandler.request(io, request)
    })
    socket.on('friendship:update', request => {
        if(isAuthorized(socket)) friendsHandler.update(io, request)
    })
    socket.on('friendship:remove', otherUser => {
        if(isAuthorized(socket)) friendsHandler.remove(io, userInfo, otherUser)
    })

}
