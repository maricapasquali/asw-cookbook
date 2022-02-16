import userRoute from './user'
import friendRoute from './user/friend'
import foodRoute from './food'
import shoppingListRoute from './shopping-list'
import recipeRoute from './recipe'
import notificationRoute from './notification'
import chatRoute from './chat'
import * as path from "path";

export default function (app: any) {
    app.get('/images/:filename', (req, res) => res.status(200).sendFile(
        path.resolve('cookbook-server/images/' + req.params.filename)
    ))
    app.get('/videos/:filename', (req, res) => res.status(200).sendFile(
        path.resolve('cookbook-server/videos/' + req.params.filename)
    ))
    userRoute(app)
    friendRoute(app)
    foodRoute(app)
    shoppingListRoute(app)
    recipeRoute(app)
    notificationRoute(app)
    chatRoute(app)
}
