const express = require("express")
const app = express()
const fs = require("fs")
const path = require("path")
const serveStatic = require("serve-static")
const history = require("connect-history-api-fallback")
const { createProxyMiddleware } = require("http-proxy-middleware")
const { Hosting } = require("cookbook-shared/dist/libs/hosting")
const config = require("cookbook-shared/dist/environment").default
const { isDevelopmentMode } = require("cookbook-shared/dist/environment/mode")

const optionsProxy = {
    ssl: {
        key: fs.readFileSync(path.resolve("sslcert", "proxy.key.pem"), "utf8"),
        cert: fs.readFileSync(path.resolve("sslcert", "proxy.cert.pem"), "utf8")
    },
    target: config.server.origin,
    secure: false, // because in ssl there is self signed certificate,
    logLevel: isDevelopmentMode(config.mode) ? "debug" : "silent"
}

const proxyMiddleware = createProxyMiddleware(optionsProxy)
const wsProxyMiddleware = createProxyMiddleware(Object.assign(optionsProxy, { ws: true }))

app.use(/^\/(api|images|videos|icons)\/.*$/, proxyMiddleware)
app.use("/socket.io", wsProxyMiddleware)

app.use(history())
app.use(serveStatic(path.join(__dirname, "dist")))

const optionsHttps = {
    key: fs.readFileSync(path.join(__dirname, "sslcert", "privatekey.pem")),
    cert: fs.readFileSync(path.join(__dirname, "sslcert", "cert.pem"))
}

Hosting
    .createHttpsServer(app, optionsHttps)
    .setHostName(config.client.hostname)
    .setPort(config.client.port)
    .build()
    .listen(hosting => {
        console.log(`Client running at ${config.externalOriginOf("client")}`)

        hosting.server.on("upgrade", wsProxyMiddleware.upgrade)
    })
