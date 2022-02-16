const path = require("path")
const dotenv = require("dotenv")
dotenv.config({ path: path.join(__dirname, '.env') })

const protocol_server = process.env.COOKBOOK_SERVER_PROTOCOL || "https"
const hostname_server = process.env.COOKBOOK_SERVER_HOSTNAME || "localhost"
const port_server = parseInt(process.env.COOKBOOK_SERVER_PORT) || 3000
const server_origin = `${protocol_server}://${hostname_server}:${port_server}`
const api_origin = `${server_origin}/api`
const images_origin = `${server_origin}/images`
const videos_origin = `${server_origin}/videos`

const protocol_client = process.env.COOKBOOK_CLIENT_PROTOCOL || "https"
const hostname_client = process.env.COOKBOOK_CLIENT_HOSTNAME || "localhost"
const port_client = parseInt(process.env.COOKBOOK_CLIENT_PORT)  || 5000
const client_origin = `${protocol_client}://${hostname_client}:${port_client}`

module.exports = {
    appName: 'CookBook',
    server: {
        protocol: protocol_server,
        hostname: hostname_server,
        port: port_server,
        origin: server_origin,
        'sub-domain': {
            api: api_origin,
            images: images_origin,
            videos: videos_origin
        }
    },
    client: {
        protocol: protocol_client,
        hostname: hostname_client,
        port: port_client,
        origin: client_origin
    }
}
