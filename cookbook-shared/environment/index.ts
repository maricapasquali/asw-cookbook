import * as dotenv from "dotenv"
import * as dotenvExpand from "dotenv-expand"
import * as path from "path"

const DEVELOPMENT = "development"

dotenvExpand.expand(dotenv.config({ path: path.join(__dirname, '.env') }))

const protocol = "https"

let hostname_server: string
let port_server: number

let hostname_client: string
let port_client: number

if(process.env.DOCKER_CONTAINER_ENV) {

    let isDevMode = process.env.NODE_ENV === DEVELOPMENT
    const _dev = isDevMode ? "-dev" : ''

    hostname_server = "server-app" + _dev
    port_server = isDevMode ? 3001 : 3000

    hostname_client = "client-app" + _dev
    port_client = isDevMode ? 5001 : 5000

} else {

    hostname_server = process.env.COOKBOOK_SERVER_HOSTNAME || process.env.VUE_APP_COOKBOOK_SERVER_HOSTNAME || "localhost"
    port_server = +process.env.COOKBOOK_SERVER_PORT || +process.env.VUE_APP_COOKBOOK_SERVER_PORT || 3000

    hostname_client = process.env.COOKBOOK_CLIENT_HOSTNAME || process.env.VUE_APP_COOKBOOK_CLIENT_HOSTNAME || "localhost"
    port_client = +process.env.COOKBOOK_CLIENT_PORT || +process.env.VUE_APP_COOKBOOK_CLIENT_PORT || 5000
}

const databaseURI = (process.env.NODE_ENV === "test" ? process.env.DATABASE_TEST_URI || "mongodb://localhost:27017/cookbook-test" : process.env.DATABASE_URI || "mongodb://localhost:27017/cookbook" )

const server_origin = `${protocol}://${hostname_server}:${port_server}`
const api_pathname = "/api"
const images_pathname = "/images"
const videos_pathname = "/videos"

const client_origin = `${protocol}://${hostname_client}:${port_client}`

let environment = {
    appName: 'CookBook',
    mode: process.env.NODE_ENV || DEVELOPMENT,
    server: {
        protocol: protocol,
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
        protocol: protocol,
        hostname: hostname_client,
        port: port_client,
        origin: client_origin
    },
    database: {
        uri: databaseURI
    }
}

if(environment.mode !== DEVELOPMENT) {
    console.debug = function (...args){}
    console.error = function (...args){}
}

console.debug("Environment = ", environment)

export default environment
