import apiRoutes from "./api"
import serverRoute from "./server"

export default function (app: any) {
    apiRoutes(app)

    serverRoute(app)
}
