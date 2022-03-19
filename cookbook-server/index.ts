import * as express from 'express'
import * as fs from 'fs';
import * as path from 'path';
import * as cors from 'cors';

import * as YAML from "yamljs"
import * as swaggerUi from 'swagger-ui-express'

import * as config from "../env.config"
import {Hosting} from "../modules/hosting"
import * as database from './database'
import routes from './routes'
import socket from './sockets'
import {requestId} from './modules/middleware'

const app = express();
app.use(express.json());
app.use(cors({ origin: config.client.origin })) //used to enable HTTPS requests from a different source
app.use(requestId)
/**
 * DATABASE CONNECTION
 */
database.connect()

/**
 * ROUTES
 */
routes(app)

/**
 * SHOW REST API DOCUMENTATIONS
 */

const swaggerCookbookAPI = YAML.load(path.join(__dirname, 'api-docs', 'api-documentations.yaml'));
const apiDocsRouteName = "/api-docs"
app.use(apiDocsRouteName, swaggerUi.serveFiles(swaggerCookbookAPI, {}), swaggerUi.setup(swaggerCookbookAPI));

/**
 * ROUTE NOT FOUND
 */
app.use(function (req, res, next) {
    if(req.originalUrl === '/') return next()
    res.status(404).json({ error: { description: req.originalUrl + " not found" } });
});
/**
 * MAIN ROUTE
 */
app.use(function (req, res) {
    res.status(200).send(`<p>Server is running ...</p><p><a href="${apiDocsRouteName}">Documentation api</a></p>`)
});

/**
 * SERVER INIT
 */
const ServerConfig = config.server
new Hosting(app)
    .setHttpsOptions(() => {
        return {
            key: fs.readFileSync(path.join(__dirname,"sslcert", "privatekey.pem")),
            cert: fs.readFileSync(path.join(__dirname,"sslcert", "cert.pem"))
        }
    })
    .setHostName(ServerConfig.hostname)
    .setPort(ServerConfig.port)
    .setSocket(socket)
    .build()
    .listen((hosting) => {
        console.log(`Server running at ${hosting.origin}`);
    });
