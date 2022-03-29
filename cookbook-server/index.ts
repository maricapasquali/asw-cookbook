import * as express from 'express'
import * as fs from 'fs';
import * as path from 'path';
import * as cors from 'cors';

import * as config from "../environment/env.config"
import {Hosting} from "../commons/modules/hosting"
import * as database from './database'
import routes from './routes'
import socket from './sockets'
import {requestId} from './modules/middleware'

const app = express();
app.use(express.json());
app.use(cors({ origin: config.client.origin })) //used to enable HTTPS requests from a different source
app.use(requestId)

const views = path.join(__dirname ,'views')
app.set('view engine', 'ejs');
app.set('views', views)

app.use(express.static(views))
app.use('/libs', express.static(path.join(__dirname, 'node_modules')))

/**
 * DATABASE CONNECTION
 */
database.connect()

/**
 * ROUTES
 */
routes(app)

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
