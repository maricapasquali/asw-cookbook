import {create_notification} from "../../controllers/notification";
import {Notification} from "../../models/schemas/notification";
import {ILike} from "../../models/schemas/recipe/like";

export function recipe(io: any, recipe: any, like: ILike): void {
    const recipeOwner = recipe.owner?._id
    console.debug('recipe = ', recipe, ', like = ', like)

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
        .then(notification => io.to(like.user._id).emit('like:recipe', {notification, like}), err => console.error(err))
    }

    create_notification({
        user: recipe.owner._id,
        type: Notification.Type.LIKE,
        content: 'A ' + likerName + ' piace la tua ricetta ' + recipe.name,
        otherInfo
    })
    .then(notification => io.to(recipeOwner).emit('like:recipe', {notification, like}) , err => console.error(err))

    io.local.except([recipeOwner, like.user?._id]).emit('like:recipe', {notification: {otherInfo}, like})
}

export function comment(io: any, comment: any, like: any): void {

    const commentOwner = comment.user?._id
    console.debug('comment = ', comment, ', like = ', like)

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
        .then(notification => io.to(like.user._id).emit('like:comment', { notification, like }), err => console.error(err))
    }

    if(comment.user) {
        create_notification({
            user: comment.user._id,
            type: Notification.Type.LIKE,
            content: 'A ' + likerName + ' piace il tuo commento.',
            otherInfo
        })
        .then(notification => io.to(commentOwner).emit('like:comment', {notification, like}), err => console.error(err))
    }

    io.local.except([commentOwner, like.user?._id]).emit('like:comment', {notification: {otherInfo}, like})
}
