import * as dotenv from "dotenv"
import * as dotenvExpand from "dotenv-expand"
import * as path from "path"
import {Mode, isDevelopmentMode, isTestMode} from "./mode";

dotenvExpand.expand(dotenv.config({ path: path.join(__dirname, '.env') }))

const protocol = "https"

let hostname_server: string
let port_server: number

let hostname_client: string
let port_client: number

if(process.env.DOCKER_CONTAINER_ENV) {

    let isDevMode = isDevelopmentMode(process.env.NODE_ENV)
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

const databaseURI = isTestMode(process.env.NODE_ENV) ? (process.env.DATABASE_TEST_URI || "mongodb://localhost:27017/cookbook-test")
                                                     : (process.env.DATABASE_URI || "mongodb://localhost:27017/cookbook" )

const server_origin = `${protocol}://${hostname_server}:${port_server}`
const api_pathname = "/api"
const images_pathname = "/images"
const videos_pathname = "/videos"

const client_origin = `${protocol}://${hostname_client}:${port_client}`

let environment: any = {
    appName: 'CookBook',
    mode: (process.env.NODE_ENV as Mode) || Mode.DEVELOPMENT,
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

/**
 * @param who node from which to extract the source
 * @return origin of _who_ (client or server). If using docker, the external hostname is "localhost", otherwise {@link environment.client.origin} or {@link environment.server.origin}
 */
environment.externalOriginOf = function externalOriginOf(who: "client" | "server"): string  {
    if(process.env.DOCKER_CONTAINER_ENV) return this[who].origin.replace(this[who].hostname, "localhost")
    return this[who].origin
}

if(!isDevelopmentMode(environment.mode)) {
    console.debug = function (...args){}
    console.error = function (...args){}
}

console.debug("Environment = ", environment)

export default environment
