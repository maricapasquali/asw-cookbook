import * as path from "path";
import * as config from "../../../environment/env.config"
import * as YAML from "yamljs"
import * as swaggerUi from 'swagger-ui-express'

export default function (app){

    const app_name = config.appName

    const routes = {
        apiDocs: "/api-docs",
        signupAdmins: '/admins/signup'
    }

    app.get('/images/:filename', (req, res) => res.status(200).sendFile(path.resolve("images", req.params.filename)))

    app.get('/videos/:filename', (req, res) => res.status(200).sendFile(path.resolve("videos", req.params.filename)))

    app.get(routes.signupAdmins, (req, res) => res.status(200).render("signup-admin", { app_name }))

    /**
     * SHOW REST API DOCUMENTATIONS
     */
    const swaggerCookbookAPI = YAML.load(path.resolve("api-docs",'api-documentations.yaml'));
    swaggerCookbookAPI.servers = []
    swaggerCookbookAPI.servers.push({ url: config.server['sub-domain'].api.origin })
    swaggerCookbookAPI.paths['/admins'].post.responses['201'].headers['Access-Control-Allow-Origin'].schema.example = config.server.origin
    app.use(routes.apiDocs, swaggerUi.serveFiles(swaggerCookbookAPI, {}), swaggerUi.setup(swaggerCookbookAPI));

    /**
     * ROUTE NOT FOUND
     */
    app.use((req, res, next) => {
        if(req.originalUrl === '/') return next()
        res.status(404).render("404", { app_name });
    });

    /**
     * MAIN ROUTE
     */
    app.use((req, res) => res.status(200).render("index", { app_name, routes }));

}