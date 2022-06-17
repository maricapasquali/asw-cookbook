import * as dotenv from "dotenv"
import * as dotenvExpand from "dotenv-expand"
import * as path from "path"
import {
    isDevelopmentMode,
    isTestMode,
    Mode
} from "./mode"

dotenvExpand.expand(dotenv.config({ path: path.join(__dirname, ".env") }))

const protocol = "https"

let hostnameServer: string
let portServer: number

let hostnameClient: string
let portClient: number

if (process.env.DOCKER_CONTAINER_ENV) {

    const isDevMode = isDevelopmentMode(process.env.NODE_ENV)
    const _dev = isDevMode ? "-dev" : ""

    hostnameServer = "server-app" + _dev
    portServer = isDevMode ? 3001 : 3000

    hostnameClient = "client-app" + _dev
    portClient = isDevMode ? 5001 : 5000

} else {

    hostnameServer = process.env.COOKBOOK_SERVER_HOSTNAME || process.env.VUE_APP_COOKBOOK_SERVER_HOSTNAME || "localhost"
    portServer = +process.env.COOKBOOK_SERVER_PORT || +process.env.VUE_APP_COOKBOOK_SERVER_PORT || 3000

    hostnameClient = process.env.COOKBOOK_CLIENT_HOSTNAME || process.env.VUE_APP_COOKBOOK_CLIENT_HOSTNAME || "localhost"
    portClient = +process.env.COOKBOOK_CLIENT_PORT || +process.env.VUE_APP_COOKBOOK_CLIENT_PORT || 5000
}

const databaseURI = isTestMode(process.env.NODE_ENV) ? (process.env.DATABASE_TEST_URI || "mongodb://localhost:27017/cookbook-test")
    : (process.env.DATABASE_URI || "mongodb://localhost:27017/cookbook" )

const serverOrigin = `${protocol}://${hostnameServer}:${portServer}`
const apiPathname = "/api"
const imagesPathname = "/images"
const videosPathname = "/videos"

const clientOrigin = `${protocol}://${hostnameClient}:${portClient}`

const environment: any = {
    appName: "CookBook",
    mode: (process.env.NODE_ENV as Mode) || Mode.DEVELOPMENT,
    test: {
        "server-port":  +process.env.COOKBOOK_TEST_SERVER_PORT || 3002,
    },
    server: {
        protocol: protocol,
        hostname: hostnameServer,
        port: portServer,
        origin: serverOrigin,
        "sub-domain": {
            api: {
                origin: serverOrigin + apiPathname,
                pathname: apiPathname
            },
            images: {
                origin: serverOrigin + imagesPathname,
                pathname: imagesPathname
            },
            videos: {
                origin: serverOrigin + videosPathname,
                pathname: videosPathname
            },
        }
    },
    client: {
        protocol: protocol,
        hostname: hostnameClient,
        port: portClient,
        origin: clientOrigin
    },
    database: {
        uri: databaseURI
    }
}

/**
 * @param who node from which to extract the source
 * @return origin of _who_ (client or server). If using docker, the external hostname is "localhost", otherwise {@link environment.client.origin} or {@link environment.server.origin}
 */
environment.externalOriginOf = function (who: "client" | "server"): string  {
    if (process.env.DOCKER_CONTAINER_ENV) return this[who].origin.replace(this[who].hostname, "localhost")
    return this[who].origin
}

if (!isDevelopmentMode(environment.mode)) {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    console.debug = function () { }
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    console.error = function () { }
}

console.debug("Environment = ", environment)

export default environment
