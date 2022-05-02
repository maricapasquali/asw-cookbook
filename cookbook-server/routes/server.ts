import * as path from "path";
import * as YAML from "yamljs"
import * as swaggerUi from 'swagger-ui-express'

export default function (app){

    const routes = {
        apiDocs: "/api-docs",
        signupAdmins: '/admins/signup',

        filesystem : {
            images: '/images/:filename',
            videos: '/videos/:filename',
        }
    }

    app.get(routes.filesystem.images, (req, res) => res.status(200).sendFile(path.resolve(FileConfigurationImage.dest, req.params.filename)))
    app.get(routes.filesystem.videos, (req, res) => res.status(200).sendFile(path.resolve(FileConfigurationVideo.dest, req.params.filename)))

    app.get(routes.signupAdmins, (req, res) => res.status(200).render("signup-admin", { app_name }))

    /**
     * SHOW REST API DOCUMENTATIONS
     */
    const swaggerCookbookAPI = YAML.load(path.resolve("api-docs",'api-documentations.yaml'));
    swaggerCookbookAPI.servers = []
    swaggerCookbookAPI.servers.push({ url: configuration.server['sub-domain'].api.origin })
    swaggerCookbookAPI.paths['/admins'].post.responses['201'].headers['Access-Control-Allow-Origin'].schema.example = configuration.server.origin
    app.use(routes.apiDocs, swaggerUi.serveFiles(swaggerCookbookAPI, {}), swaggerUi.setup(swaggerCookbookAPI));

    /**
     * ROUTE ERROR HANDLER
     */
    app.use((err, req, res, next) => {
        // No routes handled the request and no system error, that means 404 issue.
        // Forward to next middleware to handle it.
        if (!err) return next();
        console.error(err)
        let status = err.status || 500
        delete err.status
        // render the error page
        res.status(status).json(err);
    })

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