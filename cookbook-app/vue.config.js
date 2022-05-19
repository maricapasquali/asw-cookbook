const path = require('path')
const fs = require('fs')
const config = require("cookbook-shared/environment").default

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
                '@': path.resolve(__dirname, 'src'),
                '@api': path.resolve(__dirname, 'src/services/api'),
                '@assets': path.resolve(__dirname, 'src/assets'),
                '@components': path.resolve(__dirname, 'src/components'),
                '@mixins': path.resolve(__dirname, 'src/mixins'),
                '@plugins': path.resolve(__dirname, 'src/plugins'),
                '@router': path.resolve(__dirname, 'src/router'),
                '@services': path.resolve(__dirname, 'src/services'),
                '@store': path.resolve(__dirname, 'src/store'),
                '@utils': path.resolve(__dirname, 'src/utils'),
                '@views': path.resolve(__dirname, 'src/views'),
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
                additionalData: `
                    @import 'bootstrap/scss/bootstrap';
                    @import "@/style/scss/application.scss";
                `
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
                ws: true
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
