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
                '@root-project': path.resolve(__dirname),
                '@': path.resolve(__dirname, 'cookbook-app/src'),
                '@components': path.resolve(__dirname, 'cookbook-app/src/components'),
                '@assets': path.resolve(__dirname, 'cookbook-app/src/assets'),
                '@views': path.resolve(__dirname, 'cookbook-app/src/views'),
                '~': path.resolve(__dirname, 'cookbook-app/src/modules'),
                '@router': path.resolve(__dirname, 'cookbook-app/src/router'),
                '@store': path.resolve(__dirname, 'cookbook-app/src/store'),
                '@api': path.resolve(__dirname, 'cookbook-app/src/api'),
                '@event-bus': path.resolve(__dirname, 'cookbook-app/src/event-bus'),
                '@socket': path.resolve(__dirname, 'cookbook-app/src/socket'),
            }
        },
        module: {
            rules: [
                {
                    test: /\.m?js$/,
                    exclude: /(node_modules)/,
                    use: {
                        loader: 'babel-loader'
                    }
                }
            ],
        }
    },
    chainWebpack: (config) => {
        const svgRule = config.module.rule('svg');
        svgRule.uses.clear();
        svgRule
            .use('babel-loader')
            .loader('babel-loader')
            .end()
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
