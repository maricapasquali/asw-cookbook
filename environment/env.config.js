const dotenv = require("dotenv");
const dotenvExpand = require('dotenv-expand')
const path = require("path");

myEnv = dotenv.config({ path: path.join(__dirname, '.env') })
dotenvExpand.expand(myEnv)

let _environment;

let protocol_server
let hostname_server
let port_server

let protocol_client
let hostname_client
let port_client

if(process.env.DOCKER_CONTAINER_ENV) {

    let isDevMode = process.env.NODE_ENV === "development"
    const _dev = isDevMode ? "-dev" : ''

    protocol_server = process.env.SERVER_PROTOCOL || "https"
    hostname_server = process.env.SERVER_HOSTNAME || ("server-app" + _dev)
    port_server = parseInt(process.env.SERVER_PORT) || 3000

    protocol_client = process.env.CLIENT_PROTOCOL || "https"
    hostname_client = process.env.CLIENT_HOSTNAME || ("client-app" + _dev)
    port_client = parseInt(process.env.CLIENT_PORT) || 5000

} else {

    protocol_server = process.env.COOKBOOK_SERVER_PROTOCOL || process.env.VUE_APP_COOKBOOK_SERVER_PROTOCOL || "https"
    hostname_server = process.env.COOKBOOK_SERVER_HOSTNAME || process.env.VUE_APP_COOKBOOK_SERVER_HOSTNAME || "localhost"
    port_server = parseInt(process.env.COOKBOOK_SERVER_PORT || process.env.VUE_APP_COOKBOOK_SERVER_PORT) || 3000

    protocol_client = process.env.COOKBOOK_CLIENT_PROTOCOL || process.env.VUE_APP_COOKBOOK_CLIENT_PROTOCOL || "https"
    hostname_client = process.env.COOKBOOK_CLIENT_HOSTNAME || process.env.VUE_APP_COOKBOOK_CLIENT_HOSTNAME || "localhost"
    port_client = parseInt(process.env.COOKBOOK_CLIENT_PORT || process.env.VUE_APP_COOKBOOK_CLIENT_PORT) || 5000
}

databaseURI = process.env.DATABASE_URI || "mongodb://localhost:27017/cookbook"

const server_origin = `${protocol_server}://${hostname_server}:${port_server}`
const api_pathname = "/api"
const images_pathname = "/images"
const videos_pathname = "/videos"

const client_origin = `${protocol_client}://${hostname_client}:${port_client}`

_environment = {
    appName: 'CookBook',
    mode: process.env.NODE_ENV || "development",
    server: {
        protocol: protocol_server,
        hostname: hostname_server,
        port: port_server,
        origin: server_origin,
        'sub-domain': {
            api: { origin: server_origin + api_pathname, pathname: api_pathname },
            images: { origin: server_origin + images_pathname, pathname: images_pathname },
            videos: { origin: server_origin + videos_pathname, pathname: videos_pathname },
        }
    },
    client: {
        protocol: protocol_client,
        hostname: hostname_client,
        port: port_client,
        origin: client_origin
    },
    database: {
        uri: databaseURI
    }
}

console.debug("Environment = ", _environment)

module.exports = _environment
