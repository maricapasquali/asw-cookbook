import userRoute from './user'
import adminRoute from './user/admin'
import friendRoute from './user/friend'
import foodRoute from './food'
import shoppingListRoute from './shopping-list'
import recipeRoute from './recipe'
import notificationRoute from './notification'
import chatRoute from './chat'
import filesRoute from './files'

export default function (app: any) {
    userRoute(app)
    adminRoute(app)
    friendRoute(app)
    foodRoute(app)
    shoppingListRoute(app)
    recipeRoute(app)
    notificationRoute(app)
    chatRoute(app)

    filesRoute(app)
}
