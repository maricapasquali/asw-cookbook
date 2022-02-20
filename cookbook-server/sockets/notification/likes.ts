import {create_notification} from "../../controllers/notification";
import {Notification} from "../../models/schemas/notification";
import {ILike} from "../../models/schemas/recipe/like";
import {findConnectedUserBy} from "../users";

export function recipe(socket: any, recipe: any, like: ILike): void {
    const recipeOwner = findConnectedUserBy('_id', recipe.owner._id)
    console.log('recipe = ', recipe, ', like = ', like)

    const likerName = like.user ? like.user.userID : 'Anonimo'
    const otherInfo = {
        recipe: { _id: recipe._id, owner: recipe.owner?._id },
        liker: like.user?._id
    }

    if(like.user) {
        create_notification({
            user: like.user._id,
            type: Notification.Type.LIKE,
            content: 'Ti piace la ricetta ' + recipe.name + ' di ' + recipe.owner.userID,
            otherInfo
        })
        .then(notification => socket.emit('like:recipe', {notification}), err => console.error(err))
    }

    create_notification({
        user: recipe.owner._id,
        type: Notification.Type.LIKE,
        content: 'A ' + likerName + ' piace la tua ricetta ' + recipe.name,
        otherInfo
    })
    .then(notification => {
        if(recipeOwner.info) socket.to(recipeOwner.info.socketID).emit('like:recipe', {notification, like})
    }, err => console.error(err))

    socket.broadcast.except(recipeOwner.info?.socketID).emit('like:comment', {notification: {otherInfo}, like})
}

export function comment(socket: any, comment: any, like: any): void {

    const commentOwner = findConnectedUserBy('_id', comment.user && comment.user._id)
    console.log('comment = ', comment, ', like = ', like)

    const likerName = like.user ? like.user.userID : 'Anonimo'
    const commentName = comment.user ? comment.user.userID : 'Anonimo'
    const otherInfo = {
        recipe: { _id: comment.recipe._id, owner: comment.recipe.owner?._id },
        comment: { _id: comment._id, owner: comment.user?._id },
        liker: like.user?._id
    }

    if(like.user) {
        create_notification({
            user: like.user._id,
            type: Notification.Type.LIKE,
            content: 'Ti piace il commento di ' + commentName + ' alla ricetta ' + comment.recipe.name,
            otherInfo
        })
        .then(notification => socket.emit('like:comment', { notification }), err => console.error(err))
    }

    if(comment.user) {
        create_notification({
            user: comment.user._id,
            type: Notification.Type.LIKE,
            content: 'A ' + likerName + ' piace il tuo commento.',
            otherInfo
        })
        .then(notification => {
            if(commentOwner.info) socket.to(commentOwner.info.socketID).emit('like:comment', {notification, like})
        }, err => console.error(err))
    }

    socket.broadcast.except(commentOwner.info?.socketID).emit('like:comment', {notification: {otherInfo}, like})
}
