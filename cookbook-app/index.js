const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');
const serveStatic = require('serve-static');
const history = require('connect-history-api-fallback');
const { createProxyMiddleware } = require('http-proxy-middleware');
const {Hosting} = require('../commons/modules/hosting')
const config = require('../environment/env.config')

const optionsProxy =  {
    ssl: {
        key: fs.readFileSync(path.resolve("sslcert", "proxy.key.pem"), 'utf8'),
        cert: fs.readFileSync(path.resolve("sslcert", "proxy.cert.pem"), 'utf8')
    },
    target: config.server.origin,
    secure: false, // because in ssl there is self signed certificate,
    logLevel: config.mode === "development" ? "debug": "info"
}

const proxyMiddleware = createProxyMiddleware(optionsProxy)
const wsProxyMiddleware = createProxyMiddleware(Object.assign(optionsProxy, { ws: true }))

app.use(/^\/(api|images|videos)\/.*$/, proxyMiddleware);
app.use('/socket.io', wsProxyMiddleware);

app.use(history())
app.use(serveStatic(path.join(__dirname , "dist")));

new Hosting(app)
    .setHttpsOptions(() => {
        return {
            key: fs.readFileSync(path.join(__dirname,"sslcert","privatekey.pem")),
            cert: fs.readFileSync(path.join(__dirname,"sslcert","cert.pem"))
        }
    })
    .setHostName(config.client.hostname)
    .setPort(config.client.port)
    .build()
    .listen((hosting) => {
        console.log(`Client running at ${hosting.origin}`);

        hosting.server.on('upgrade', wsProxyMiddleware.upgrade);
    });
