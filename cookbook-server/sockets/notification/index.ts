import * as friendsHandler from './friends'
import * as foodsHandler from './foods'
import * as commentsHandler from './comments'
import * as recipesHandler from './recipes'
import * as likesHandler from './likes'
import * as userInfosHandler from './user-infos'

import {userInformation} from "../rooms/user";
import {containInAdminsRoom} from "../rooms";

export default function (io: any, socket: any): void {

    let userInfo = userInformation(socket)
    //USER
    socket.on('user:update:password', () => {
        userInfosHandler.password(io, userInfo.id)
    })
    socket.on('user:strike', user => {
        if(containInAdminsRoom(io, socket)) {
            console.debug('Add strike => User :', userInfo.name)
            userInfosHandler.strike(io, user)
        }
    })

    //CREATE SHARED RECIPE
    socket.on('recipe:create', recipe => {
        recipesHandler.create(io, recipe)
    })
    //CREATE SAVED RECIPE
    socket.on('recipe:create:saved', recipe => {
        recipesHandler.createSaved(io, recipe)
    })
    // RECIPE
    socket.on('recipe:update', recipe => {
        recipesHandler.update(io, userInfo, recipe)
    })
    socket.on('recipe:delete', recipe => {
        recipesHandler.erase(io, userInfo, recipe)
    })
    socket.on('recipe:comment', (recipe, comment) => recipesHandler.comment(io, recipe, comment))

    //FOOD
    socket.on('food:create', food => {
        foodsHandler.create(io, userInfo, food)
    })

    // LIKE ON RECIPE OR COMMENT
    socket.on('like:recipe', (recipe, like) => likesHandler.recipe(io, recipe, like))
    socket.on('like:comment', (comment, like) => likesHandler.comment(io, comment, like))

    // COMMENT
    socket.on('comment:response', (comment, response) => commentsHandler.response(io, comment, response))
    socket.on('comment:report', (comment, reporter) => commentsHandler.report(io, comment, reporter))

    // FRIENDS
    socket.on('friendship:request', request => {
        friendsHandler.request(io, request)
    })
    socket.on('friendship:update', request => {
        friendsHandler.update(io, request)
    })
    socket.on('friendship:remove', otherUser => {
        friendsHandler.remove(io, userInfo, otherUser)
    })

}
