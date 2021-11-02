import userRoute from './user'
import * as path from "path";

export = function (app: any) {
    app.get('/images/:filename', (req, res) => res.status(200).sendFile(
        path.resolve('cookbook-server/images/' + req.params.filename)
    ))
    app.get('/videos/:filename', (req, res) => res.status(200).sendFile(
        path.resolve('cookbook-server/videos/' + req.params.filename)
    ))
    userRoute(app)
    //TODO: ADD OTHER ROUTES
}
