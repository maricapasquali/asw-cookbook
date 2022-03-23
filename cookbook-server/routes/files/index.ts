import * as path from "path";
import * as config from "../../../env.config"
import * as YAML from "yamljs"
import * as swaggerUi from 'swagger-ui-express'

export default function (app){

    const rootDir = "cookbook-server"
    const imagesDir = path.join(rootDir,"images")
    const videosDir = path.join(rootDir,"videos")
    const apiDocsDir = path.join(rootDir,"api-docs")

    const app_name = config.appName

    const routes = {
        apiDocs: "/api-docs",
        signupAdmins: '/admins/signup'
    }

    app.get('/images/:filename', (req, res) => res.status(200).sendFile(path.resolve(imagesDir, req.params.filename)))

    app.get('/videos/:filename', (req, res) => res.status(200).sendFile(path.resolve(videosDir, req.params.filename)))

    app.get(routes.signupAdmins, (req, res) => res.status(200).render("signup-admin", { app_name }))

    /**
     * SHOW REST API DOCUMENTATIONS
     */
    const swaggerCookbookAPI = YAML.load(path.resolve(apiDocsDir,'api-documentations.yaml'));
    swaggerCookbookAPI.servers = []
    swaggerCookbookAPI.servers.push({ url: config.server['sub-domain'].api })
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