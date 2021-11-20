import userRoute from './user'
import foodRoute from './food'
import shoppingListRoute from './shopping-list'
import recipeRoute from './recipe'
import likeRoute from './recipe/like'
import commentRoute from './recipe/comment'
import * as path from "path";

export = function (app: any) {
    app.get('/images/:filename', (req, res) => res.status(200).sendFile(
        path.resolve('cookbook-server/images/' + req.params.filename)
    ))
    app.get('/videos/:filename', (req, res) => res.status(200).sendFile(
        path.resolve('cookbook-server/videos/' + req.params.filename)
    ))
    userRoute(app)
    foodRoute(app)
    shoppingListRoute(app)
    recipeRoute(app)
    likeRoute(app)
    commentRoute(app)
    //TODO: ADD OTHER ROUTES
}
