import {IFood} from "../../models/schemas/food";
import {create_notification} from "../../controllers/notification";

import {Notification} from "../../models/schemas/notification";
import {RBAC} from "../../modules/rbac";
import Role = RBAC.Role;
import Rooms from "../rooms";
import {UserInformationType} from "../rooms/user";

export function create(io: any, userInfo: UserInformationType, food: IFood): void  {
    console.log('food = ', food)

    create_notification({
        user: food.owner,
        type: Notification.Type.FOOD,
        content: 'Hai inserito un nuovo alimento: ' + food.name,
        otherInfo: {
            food: food._id
        }
    })
    .then(notification => io.to(food.owner).emit('food:create', notification), err => console.error(err))

    create_notification({
        user: Role.ADMIN,
        type: Notification.Type.FOOD,
        content: userInfo.name  + ' ha inserito un nuovo alimento: ' + food.name,
        otherInfo: {
            creator: food.owner,
            food: food._id
        }
    })
    .then(notification => io.to(Rooms.ADMINS).except(food.owner).emit('food:create', notification), err => console.error(err))

    io.to(Rooms.SIGNED).except(food.owner).emit('food:create')
}
