import "./modules/global"

import * as express from 'express'
import * as fs from 'fs';
import * as path from 'path';
import * as cors from 'cors';
import {Server} from "socket.io";

import {Hosting, HTTPSOptions} from "cookbook-shared/libs/hosting"
import * as database from './src/database'
import routes from './src/routes'
import socket from './src/sockets'
import {requestId} from './src/middlewares'
import * as staticDirectory from "./static"

const app = express();
app.use(express.json());
app.use(cors({ origin: configuration.client.origin })) //used to enable HTTPS requests from a different source
app.use(requestId)

const views = path.join(__dirname ,'views')
app.set('view engine', 'ejs');
app.set('views', views)

/**
 * STATIC FILES
 */
staticDirectory.staticFiles(app)

/**
 * DATABASE CONNECTION
 */
database.connect().then(() => console.log('Database is connected.'), err => console.error("Connection database fail.\n", err))

/**
 * ROUTES
 */
routes(app)

/**
 * SERVER INIT
 */
const ServerConfig = configuration.server
const optionsHttps: HTTPSOptions = {
    key: fs.readFileSync(path.join(__dirname,"sslcert", "privatekey.pem")),
    cert: fs.readFileSync(path.join(__dirname,"sslcert", "cert.pem"))
}
Hosting
    .createHttpsServer(app, optionsHttps)
    .setHostName(ServerConfig.hostname)
    .setPort(ServerConfig.port)
    .setSocket((server) => {
        socket(new Server(server, {
            cors: {
                origin: configuration.client.origin,
                methods: ["GET", "POST"],
                credentials: true
            }
        }))
    })
    .build()
    .listen((hosting) => {
        console.log(`Server running at ${hosting.origin}`);
    });
