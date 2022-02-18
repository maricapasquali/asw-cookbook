import {findAdminSocketIDs, findAnonymousSocketIDs, findConnectedUserBy} from "../users";
import {IFood} from "../../models/schemas/food";
import {create_notification} from "../../controllers/notification";

import {Notification} from "../../models/schemas/notification";
import {RBAC} from "../../modules/rbac";
import Role = RBAC.Role;

export function create(socket: any, food: IFood): void  {
    const user = findConnectedUserBy('_id', food.owner)
    const admins = findAdminSocketIDs()
    console.log('food = ', food)

    create_notification({
        user: food.owner,
        type: Notification.Type.FOOD,
        content: 'Hai inserito un nuovo alimento: ' + food.name,
        otherInfo: {
            food: food._id
        }
    })
    .then(notification => socket.emit('food:create', notification), err => console.error(err))

    create_notification({
        user: Role.ADMIN,
        type: Notification.Type.FOOD,
        content: user.info.user.userID  + ' ha inserito un nuovo alimento: ' + food.name,
        otherInfo: {
            creator: food.owner,
            food: food._id
        }
    })
    .then(notification => {
        if(admins.length) socket.to(admins).emit('food:create', notification)
    }, err => console.error(err))

    let anonymousUserSocketID = findAnonymousSocketIDs()
    socket.broadcast.except([...admins, ...anonymousUserSocketID]).emit('food:create')
}