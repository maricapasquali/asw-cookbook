const path = require('path')
const fs = require('fs')
const {port_server, hostname, protocol, port_client} = require("./modules/hosting/variables");
const appConfig = require('./app.config.json')

module.exports = {
    pages: {
        index: {
            entry: 'cookbook-app/src/main.js',
            title: appConfig.app_name,
            template: 'cookbook-app/public/index.html'
        }
    },
    configureWebpack: {
        resolve: {
            alias: {
                '@app': path.resolve(__dirname),
                '@': path.resolve(__dirname, 'cookbook-app/src'),
                '@components': path.resolve(__dirname, 'cookbook-app/src/components'),
                '@assets': path.resolve(__dirname, 'cookbook-app/src/assets'),
                '@views': path.resolve(__dirname, 'cookbook-app/src/views'),
                '@router': path.resolve(__dirname, 'cookbook-app/src/router'),
                '@services': path.resolve(__dirname, 'cookbook-app/src/services'),
                '@api': path.resolve(__dirname, 'cookbook-app/src/services/api')
            }
        },
    },
    chainWebpack: (config) => {
        const svgRule = config.module.rule('svg');
        svgRule.uses.clear();
        svgRule
            .use('vue-svg-loader')
            .loader('vue-svg-loader');
    },
    css: {
        loaderOptions: {
            sass: {
                additionalData: `@import "@assets/scss/globals.scss";`,
            },
        },
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
