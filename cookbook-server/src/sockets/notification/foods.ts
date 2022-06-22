import { IFood } from "../../models/schemas/food"
import { createNotification } from "../../controllers/notification"

import { Notification } from "../../models/schemas/notification"
import { RBAC } from "../../libs/rbac"
import Rooms from "../rooms"
import { UserInformationType } from "../rooms/user"
import Role = RBAC.Role

export function create(io: any, userInfo: UserInformationType, food: IFood): void {
    console.debug("food = ", food)

    createNotification({
        user: food.owner,
        type: Notification.Type.FOOD,
        content: "Hai inserito un nuovo alimento: " + food.name,
        otherInfo: {
            food: food._id
        }
    })
        .then(notification => io.to(food.owner)
            .emit("food:create", notification), err => console.error(err))

    createNotification({
        user: Role.ADMIN,
        type: Notification.Type.FOOD,
        content: userInfo.name + " ha inserito un nuovo alimento: " + food.name,
        otherInfo: {
            creator: food.owner,
            food: food._id
        }
    })
        .then(notification => io.to(Rooms.ADMINS)
            .except(food.owner)
            .emit("food:create", notification), err => console.error(err))

    io.to(Rooms.SIGNED)
        .except(food.owner)
        .emit("food:create")
}
