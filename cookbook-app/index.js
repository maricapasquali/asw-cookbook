const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');
const serveStatic = require('serve-static');
const {Hosting} = require("../modules/hosting")
const {port_client} = require("../modules/hosting/variables")

app.use(serveStatic(path.join(__dirname , "dist")));

app.use(function (req, res) {
    res.status(404).send("404 - Page not found");
});

new Hosting(app)
    .setHttpsOptions(() => {
        return {
            key: fs.readFileSync(path.join(__dirname,"sslcert","privatekey.pem")),
            cert: fs.readFileSync(path.join(__dirname,"sslcert","cert.pem"))
        }
    })
    .setPort(port_client)
    .build()
    .listen((server) => {
        console.log(`Client running at ${server.protocol}://${server.hostname}:${server.port}/`);
    });
