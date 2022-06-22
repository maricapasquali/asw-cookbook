import { IComment } from "../../models/schemas/recipe/comment"
import { createNotification } from "../../controllers/notification"
import { Notification } from "../../models/schemas/notification"
import { IRecipe } from "../../models/schemas/recipe"
import { Friend } from "../../models"
import {
    FriendShip,
    IFriend
} from "../../models/schemas/user/friend"
import { IPermission } from "../../models/schemas/recipe/permission"
import { UserInformationType } from "../rooms/user"

function getFriendOf(user: string): Promise<IFriend[]> {
    return Friend.find({ $or: [{ from: { $eq: user } }, { to: { $eq: user } }], state: FriendShip.State.ACCEPTED })
        .then(users => Promise.resolve(users.map(_user => _user.from == user ? _user.to : (_user.to == user ? _user.from : false))
            .map(u => u.toString())),
        err => Promise.reject(err))
}

function operationOnRecipe(io: any, user: UserInformationType, operation: "update" | "delete", recipe: IRecipe): void {
    console.debug(operation + " shared recipe : ", recipe)
    console.debug("shared recipe permissions : ", recipe.permission)

    let permissionGranted: (value: string) => boolean
    let operationString: string
    let _recipe: IRecipe | string
    switch (operation) {
        case "update":
            permissionGranted = IPermission.GrantedType.isWritePermission
            operationString = "modificato"
            _recipe = recipe
            break
        case "delete":
            permissionGranted = IPermission.GrantedType.isRootPermission
            operationString = "eliminato"
            _recipe = recipe._id
            break
    }

    const permission = recipe.permission.find(p => p.user._id == user.id && permissionGranted(p.granted))
    console.debug("permission : ", permission)
    if (permission) {
        const otherInfo = {
            recipe: operation === "delete" ? { ...recipe, ...{ deleted: true } } : { _id: recipe._id, owner: recipe.owner._id, shared: recipe.shared },
            updaterUser: permission.user._id
        }

        createNotification({
            user: permission.user._id,
            type: Notification.Type.RECIPE,
            content: "Hai " + operationString + " la ricetta " + recipe.name,
            otherInfo
        })
            .then(notification => io.to(permission.user._id)
                .emit("recipe:" + operation, { notification, recipe: _recipe }), err => console.error(err))

        if (recipe.shared) {
            const ownerId = recipe.owner._id
            const lovers = recipe.likes.filter(l => l.user)
                .map(l => l.user)
            console.debug("user lovers = ", lovers)
            for (const lover of lovers) {
                createNotification({
                    user: lover._id,
                    type: Notification.Type.RECIPE,
                    content: permission.user.userID + " ha " + operationString + " la ricetta " + recipe.name,
                    otherInfo
                })
                    .then(notification => io.to(lover._id)
                        .emit("recipe:" + operation, { notification, recipe: _recipe }), err => console.error(err))
            }

            if (ownerId != permission.user._id) {
                createNotification({
                    user: ownerId,
                    type: Notification.Type.RECIPE,
                    content: permission.user.userID + " ha " + operationString + " la tua ricetta " + recipe.name,
                    otherInfo
                })
                    .then(notification => io.to(ownerId)
                        .emit("recipe:" + operation, { notification, recipe: _recipe }), err => console.error(err))
            }

            const loversId = lovers.map(u => u._id)
            io.local.except([ownerId, permission.user._id, ...loversId])
                .emit("recipe:" + operation, { recipe: _recipe })
        } else {
            for (const _user of recipe.permission.filter(p => p.user._id != permission.user._id)
                .map(p => p.user)) {
                createNotification({
                    user: _user._id,
                    type: Notification.Type.RECIPE,
                    content: permission.user.userID + " ha " + operationString + " la ricetta " + recipe.name,
                    otherInfo
                })
                    .then(notification => io.to(_user._id)
                        .emit("recipe:" + operation, { notification, recipe: _recipe }), err => console.error(err))
            }
        }
    } else console.error("Denied permission: " + permission)
}

export function comment(io: any, recipe: any, comment: IComment): void {
    console.debug("recipe = ", recipe)
    console.debug("comment = ", comment)
    const otherInfo = {
        recipe: { _id: recipe._id, owner: recipe.owner._id },
        comment: { _id: comment._id, user: comment.user?._id },
        user: comment.user?._id
    }
    if (comment.user) {
        createNotification({
            user: comment.user._id,
            type: Notification.Type.RECIPE,
            content: "Hai commentato la ricetta " + recipe.name + " di " + recipe.owner.userID,
            otherInfo
        })
            .then(notification => io.to(comment.user._id)
                .emit("recipe:comment", { notification, comment }), err => console.error(err))
    }

    if (recipe.owner) {
        createNotification({
            user: recipe.owner._id,
            type: Notification.Type.RECIPE,
            content: (comment.user ? comment.user.userID : "Anonimo") + " ha commentato la tua ricetta " + recipe.name,
            otherInfo
        })
            .then(notification => io.to(recipe.owner._id)
                .emit("recipe:comment", { notification, comment }), err => console.error(err))
    }

    io.local.except([recipe.owner?._id, comment.user?._id])
        .emit("recipe:comment", { comment })
}

export function create(io: any, recipe: IRecipe): void {
    const ownerId = recipe.owner._id
    const ownerName = recipe.owner.userID
    console.debug("shared recipe : ", recipe)

    createNotification({
        user: ownerId,
        type: Notification.Type.RECIPE,
        content: "Hai condiviso la ricetta " + recipe.name,
        otherInfo: {
            recipe: { _id: recipe._id, owner: ownerId, shared: true }
        }
    })
        .then(notification => io.to(ownerId)
            .emit("recipe:create", { notification, recipe }), err => console.error(err))

    getFriendOf(ownerId)
        .then(friends => {
            console.debug("Friends of ", ownerId, " = ", friends)

            for (const friendID of friends) {
                createNotification({
                    user: friendID,
                    type: Notification.Type.RECIPE,
                    content: ownerName + " ha condiviso la ricetta " + recipe.name,
                    otherInfo: {
                        recipe: { _id: recipe._id, owner: ownerId, shared: true }
                    }
                })
                    .then(notification => io.to(friendID)
                        .emit("recipe:create", { notification, recipe }), err => console.error(err))
            }

            io.local.except([ownerId, ...friends])
                .emit("recipe:create", { recipe })
        }, err => console.error(err))
}

export function createSaved(io: any, recipe: IRecipe) {
    const ownerId = recipe.owner._id
    console.debug("saved recipe : ", recipe)
    createNotification({
        user: ownerId,
        type: Notification.Type.RECIPE,
        content: "Hai salvato la ricetta " + recipe.name,
        otherInfo: {
            recipe: { _id: recipe._id, owner: ownerId, shared: false },
            updaterUser: ownerId
        }
    })
        .then(notification => io.to(ownerId)
            .emit("recipe:create:saved", { notification, recipe }), err => console.error(err))
}

export function update(io: any, user: UserInformationType, recipe: IRecipe) {
    return operationOnRecipe(io, user, "update", recipe)
}

export function erase(io: any, user: UserInformationType, recipe: IRecipe) {
    return operationOnRecipe(io, user, "delete", recipe)
}
