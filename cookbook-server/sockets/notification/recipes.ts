import {IComment} from "../../models/schemas/recipe/comment";
import {create_notification} from "../../controllers/notification";
import {Notification} from "../../models/schemas/notification";
import {findConnectedUserBy} from "../users";
import {IRecipe} from "../../models/schemas/recipe";
import {Friend} from "../../models";
import {FriendShip, IFriend} from "../../models/schemas/user/friend";
import {IPermission} from "../../models/schemas/recipe/permission";

function getFriendOf(user: string): Promise<Array<IFriend>> {
    return Friend.find( { $or: [ { from: { $eq: user } }, { to: { $eq: user } } ], state : FriendShip.State.ACCEPTED } )
                 .then(users => Promise.resolve(users), err => Promise.reject(err))
}

function operationOnRecipe(socket: any, operation: 'update' | 'delete', recipe: IRecipe): void {
    const user = findConnectedUserBy('socketID', socket.id)

    console.log(operation + ' shared recipe : ', recipe)
    console.log('shared recipe permissions : ', recipe.permission)

    let permissionGranted: (value: string) => boolean
    let operationString: string
    let _recipe: IRecipe | string
    switch (operation){
        case 'update':
            permissionGranted = IPermission.GrantedType.isWritePermission
            operationString = 'modificato'
            _recipe = recipe
            break;
        case 'delete':
            permissionGranted = IPermission.GrantedType.isRootPermission
            operationString = 'eliminato'
            _recipe = recipe._id
            break;
    }

    let permission = recipe.permission.find(p => user.info && p.user._id == user.info.user._id && permissionGranted(p.granted))
    console.log('permission : ', permission)
    if(permission){
        const otherInfo = {
            recipe: operation === 'delete' ? { ...recipe, ...{ deleted:true } } : {_id:recipe._id, owner: recipe.owner._id, shared: recipe.shared},
            updaterUser: permission.user._id,
        }

        create_notification({
            user: permission.user._id,
            type: Notification.Type.RECIPE,
            content: 'Hai ' + operationString + ' la ricetta ' + recipe.name,
            otherInfo
        })
        .then(notification => socket.emit('recipe:' + operation, {notification}), err => console.error(err))

        if(recipe.shared){
            const ownerId = recipe.owner._id
            const lovers = recipe.likes.filter(l => l.user).map(l => l.user)
            console.log('user lovers = ', lovers)
            for (const lover of lovers){
                create_notification({
                    user: lover._id,
                    type: Notification.Type.RECIPE,
                    content: permission.user.userID + ' ha ' + operationString + ' la ricetta ' + recipe.name,
                    otherInfo
                })
                .then(notification => {
                    const connectedLover = findConnectedUserBy('_id', lover._id)
                    if(connectedLover.info) socket.to(connectedLover.info.socketID).emit('recipe:' + operation, {notification})
                }, err => console.error(err))
            }

            if(ownerId != permission.user._id){
                create_notification({
                    user: ownerId,
                    type: Notification.Type.RECIPE,
                    content: permission.user.userID + ' ha ' + operationString + ' la tua ricetta ' + recipe.name,
                    otherInfo
                })
                .then(notification => {
                    const connectedOwner = findConnectedUserBy('_id', ownerId)
                    if(connectedOwner.info) socket.to(connectedOwner.info.socketID).emit('recipe:'+ operation, {notification})
                }, err => console.error(err))
            }

            socket.broadcast.emit('recipe:' + operation, {recipe: _recipe})
        }
        else {
            for (const user of recipe.permission.filter(p => p.user._id != permission.user._id).map(p => p.user)){
                create_notification({
                    user: user._id,
                    type: Notification.Type.RECIPE,
                    content: permission.user.userID + ' ha ' + operationString + ' la ricetta ' + recipe.name,
                    otherInfo
                })
                .then(notification => {
                    const connectedUser = findConnectedUserBy('_id', user._id)
                    if(connectedUser.info) socket.to(connectedUser.info.socketID).emit('recipe:' + operation, {notification, recipe: _recipe})
                }, err => console.error(err))
            }
        }

    } else console.error('Denied permission: ' + permission)
}

export function comment(socket: any, recipe: any, comment: IComment): void {
    console.log('recipe = ', recipe)
    console.log('comment = ', comment)
    const onlineOwnerRecipe = findConnectedUserBy('_id', recipe.owner._id)
    const otherInfo = {
        recipe: { _id: recipe._id, owner: recipe.owner._id },
        comment: {_id: comment._id, user: comment.user ? comment.user._id: undefined},
        user: comment.user ? comment.user._id : undefined
    }
    if(comment.user){
        create_notification({
            user: comment.user._id,
            type: Notification.Type.RECIPE,
            content: 'Hai commentato la ricetta ' + recipe.name + ' di ' + recipe.owner.userID,
            otherInfo: otherInfo
        }).then(notification => socket.emit('recipe:comment', {notification}), err => console.error(err))
    }

    create_notification({
        user: recipe.owner._id,
        type: Notification.Type.RECIPE,
        content: (comment.user ? comment.user.userID: 'Anonimo')+  ' ha commentato la tua ricetta ' + recipe.name ,
        otherInfo: otherInfo
    }).then(notification => {
        if(onlineOwnerRecipe.info) socket.to(onlineOwnerRecipe.info.socketID).emit('recipe:comment', {notification, comment})
    }, err => console.error(err))

    socket.broadcast.except(onlineOwnerRecipe.info?.socketID).emit('recipe:comment', {comment})
}

export function create(socket: any, recipe: IRecipe): void {
    let ownerId = recipe.owner._id
    let ownerName = recipe.owner.userID
    console.log('shared recipe : ', recipe)

    create_notification({
        user: ownerId,
        type: Notification.Type.RECIPE,
        content: 'Hai condiviso la ricetta ' + recipe.name,
        otherInfo: {
            recipe: {_id:recipe._id, owner: ownerId}
        }
    })
    .then(notification => socket.emit('recipe:create', {notification}), err => console.error(err))

    getFriendOf(ownerId)
        .then(users => {
            for (const user of users){
                const friendID = user.from == ownerId ? user.to : (user.to == ownerId ? user.from : false)
                create_notification({
                    user: friendID,
                    type: Notification.Type.RECIPE,
                    content: ownerName + ' ha condiviso la ricetta ' + recipe.name,
                    otherInfo: {
                        recipe: {_id:recipe._id, owner: ownerId},
                    }
                }).then(notification => {
                    const connectedFriend = findConnectedUserBy('_id', friendID)
                    if(connectedFriend.info) socket.to(connectedFriend.info.socketID).emit('recipe:create', {notification})
                }, err => console.error(err))
            }
        }, err => console.error(err))

    socket.broadcast.emit('recipe:create', {recipe})
}

export const update = (socket: any, recipe: IRecipe) => operationOnRecipe(socket, 'update', recipe)

export const erase = (socket: any, recipe: IRecipe) => operationOnRecipe(socket, 'delete', recipe)
