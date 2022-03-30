const path = require('path')
const fs = require('fs')
const config = require("../environment/env.config")

module.exports = {
    pages: {
        index: {
            entry: 'src/main.js',
            title: config.appName,
            template: 'public/index.html'
        }
    },
    configureWebpack: {
        resolve: {
            alias: {
                '@environment': path.resolve(__dirname, "..", "environment"),
                '@commons': path.resolve(__dirname, "..", "commons", "modules"),
                '@': path.resolve(__dirname, 'src'),
                '@components': path.resolve(__dirname, 'src/components'),
                '@plugins': path.resolve(__dirname, 'src/plugins'),
                '@assets': path.resolve(__dirname, 'src/assets'),
                '@views': path.resolve(__dirname, 'src/views'),
                '~': path.resolve(__dirname, 'src/modules'),
                '@router': path.resolve(__dirname, 'src/router'),
                '@store': path.resolve(__dirname, 'src/store'),
                '@api': path.resolve(__dirname, 'src/api'),
                '@event-bus': path.resolve(__dirname, 'src/event-bus'),
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
    outputDir: path.join(__dirname, 'dist'),
    devServer: {
        injectClient: false,
        port: config.client.port,
        https: {
            key: fs.readFileSync(path.join(__dirname,"sslcert","privatekey.pem")),
            cert: fs.readFileSync(path.join(__dirname,"sslcert","cert.pem"))
        },
        proxy: {
            '^/socket.io': {
                target: config.server.origin,
                changeOrigin: true,
            },
            '^/api': {
                target: config.server.origin,
                changeOrigin: true,
            },
            '^/images': {
                target: config.server.origin,
                changeOrigin: true,
            },
            '^/videos': {
                target: config.server.origin,
                changeOrigin: true,
            },
        }
    },
}
