const path = require('path')
const fs = require('fs')
const {port_server, hostname, protocol, port_client} = require("./modules/hosting/variables");

module.exports = {
    pages: {
        index: {
            entry: 'cookbook-app/src/main.js',
            template: 'cookbook-app/public/index.html'
        }
    },
    configureWebpack: {
        resolve: {
            alias: {
                '@': path.resolve(__dirname, 'cookbook-app/src')
            }
        }
    },
    outputDir: path.join(__dirname, 'cookbook-app/dist'),
    devServer: {
        port: port_client,
        https: {
            key: fs.readFileSync(path.join(__dirname,"cookbook-app/sslcert","privatekey.pem")),
            cert: fs.readFileSync(path.join(__dirname,"cookbook-app/sslcert","cert.pem"))
        },
        proxy: {
            '^/api': {
                target: `${protocol}://${hostname}:${port_server}`,
                changeOrigin: true,
            },
        }
    },
}
