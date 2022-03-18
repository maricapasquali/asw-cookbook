import {IComment} from "../../models/schemas/recipe/comment";
import {create_notification} from "../../controllers/notification";
import {Notification} from "../../models/schemas/notification";
import {IRecipe} from "../../models/schemas/recipe";
import {Friend} from "../../models";
import {FriendShip, IFriend} from "../../models/schemas/user/friend";
import {IPermission} from "../../models/schemas/recipe/permission";
import {UserInformationType} from "../rooms/user";

function getFriendOf(user: string): Promise<Array<IFriend>> {
    return Friend.find( { $or: [ { from: { $eq: user } }, { to: { $eq: user } } ], state : FriendShip.State.ACCEPTED } )
                 .then(users => Promise.resolve(users.map(_user => _user.from == user ? _user.to : (_user.to == user ? _user.from : false)).map(u => u.toString())),
                       err => Promise.reject(err))
}

function operationOnRecipe(io: any, user: UserInformationType, operation: 'update' | 'delete', recipe: IRecipe): void {
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

    let permission = recipe.permission.find(p => p.user._id == user.id && permissionGranted(p.granted))
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
        .then(notification => io.to(permission.user._id).emit('recipe:' + operation, {notification, recipe: _recipe}), err => console.error(err))

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
                .then(notification => io.to(lover._id).emit('recipe:' + operation, {notification, recipe: _recipe}), err => console.error(err))
            }

            if(ownerId != permission.user._id){
                create_notification({
                    user: ownerId,
                    type: Notification.Type.RECIPE,
                    content: permission.user.userID + ' ha ' + operationString + ' la tua ricetta ' + recipe.name,
                    otherInfo
                })
                .then(notification => io.to(ownerId).emit('recipe:'+ operation, {notification, recipe: _recipe}), err => console.error(err))
            }

            let loversId = lovers.map(u => u._id)
            io.local.except([ownerId, permission.user._id, ...loversId]).emit('recipe:' + operation, {recipe: _recipe})
        }
        else {
            for (const _user of recipe.permission.filter(p => p.user._id != permission.user._id).map(p => p.user)){
                create_notification({
                    user: _user._id,
                    type: Notification.Type.RECIPE,
                    content: permission.user.userID + ' ha ' + operationString + ' la ricetta ' + recipe.name,
                    otherInfo
                })
                .then(notification => io.to(_user._id).emit('recipe:' + operation, {notification, recipe: _recipe}), err => console.error(err))
            }
        }

    } else console.error('Denied permission: ' + permission)
}

export function comment(io: any, recipe: any, comment: IComment): void {
    console.log('recipe = ', recipe)
    console.log('comment = ', comment)
    const otherInfo = {
        recipe: { _id: recipe._id, owner: recipe.owner._id },
        comment: {_id: comment._id, user: comment.user?._id},
        user: comment.user?._id
    }
    if(comment.user){
        create_notification({
            user: comment.user._id,
            type: Notification.Type.RECIPE,
            content: 'Hai commentato la ricetta ' + recipe.name + ' di ' + recipe.owner.userID,
            otherInfo: otherInfo
        })
        .then(notification => io.to(comment.user._id).emit('recipe:comment', {notification, comment}), err => console.error(err))
    }

    if(recipe.owner) {
        create_notification({
            user: recipe.owner._id,
            type: Notification.Type.RECIPE,
            content: (comment.user ? comment.user.userID: 'Anonimo')+  ' ha commentato la tua ricetta ' + recipe.name ,
            otherInfo: otherInfo
        })
        .then(notification => io.to(recipe.owner._id).emit('recipe:comment', {notification, comment}), err => console.error(err))
    }

    io.local.except([recipe.owner?._id, comment.user?._id]).emit('recipe:comment', {comment})
}

export function create(io: any, recipe: IRecipe): void {
    let ownerId = recipe.owner._id
    let ownerName = recipe.owner.userID
    console.log('shared recipe : ', recipe)

    create_notification({
        user: ownerId,
        type: Notification.Type.RECIPE,
        content: 'Hai condiviso la ricetta ' + recipe.name,
        otherInfo: {
            recipe: { _id:recipe._id, owner: ownerId, shared: true }
        }
    })
    .then(notification => io.to(ownerId).emit('recipe:create', {notification, recipe}), err => console.error(err))

    getFriendOf(ownerId)
        .then(friends => {
            console.debug('Friends of ', ownerId, ' = ', friends)

            for (const friendID of friends){
                create_notification({
                    user: friendID,
                    type: Notification.Type.RECIPE,
                    content: ownerName + ' ha condiviso la ricetta ' + recipe.name,
                    otherInfo: {
                        recipe: {_id:recipe._id, owner: ownerId, shared: true},
                    }
                })
                .then(notification => io.to(friendID).emit('recipe:create', {notification, recipe}) , err => console.error(err))
            }

            io.local.except([ownerId, ...friends]).emit('recipe:create', {recipe})

        }, err => console.error(err))

}

export function createSaved(io: any, recipe: IRecipe){
    let ownerId = recipe.owner._id
    console.log('saved recipe : ', recipe)
    create_notification({
        user: ownerId,
        type: Notification.Type.RECIPE,
        content: 'Hai salvato la ricetta ' + recipe.name,
        otherInfo: {
            recipe: { _id:recipe._id, owner: ownerId, shared: false },
            updaterUser: ownerId,
        }
    })
        .then(notification => io.to(ownerId).emit('recipe:create:saved', {notification, recipe}), err => console.error(err))
}

export const update = (io: any,  user: UserInformationType, recipe: IRecipe) => operationOnRecipe(io, user, 'update', recipe)

export const erase = (io: any,  user: UserInformationType, recipe: IRecipe) => operationOnRecipe(io, user, 'delete', recipe)
