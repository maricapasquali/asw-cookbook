const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');
const serveStatic = require('serve-static');
const {Hosting} = require('../modules/hosting')
const config = require('../env.config')

const history = require('connect-history-api-fallback');

app.use(history())

app.use(serveStatic(path.join(__dirname , "dist")));

app.use(function (req, res) {
    res.status(404).send("404 - Page not found");
});

const ClientConfiguration = config.client
new Hosting(app)
    .setHttpsOptions(() => {
        return {
            key: fs.readFileSync(path.join(__dirname,"sslcert","privatekey.pem")),
            cert: fs.readFileSync(path.join(__dirname,"sslcert","cert.pem"))
        }
    })
    .setHostName(ClientConfiguration.hostname)
    .setPort(ClientConfiguration.port)
    .build()
    .listen((hosting) => {
        console.log(`Client running at ${hosting.origin}`);
    });
