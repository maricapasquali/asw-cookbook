import * as dotenv from 'dotenv'
dotenv.config()
export const protocol: string = process.env.COOKBOOK_PROTOCOL || "https"
export const hostname: string = process.env.COOKBOOK_HOSTNAME ||"localhost"
export const port_server: number = parseInt(process.env.COOKBOOK_SERVER_PORT) || 3000
export const port_client: number = parseInt(process.env.COOKBOOK_CLIENT_PORT)  || 5000

const domainServer: string = `${protocol}://${hostname}:${port_server}`
export const server_origin: string = `${domainServer}/api`
export const images_origin: string = `${domainServer}/images`
export const video_origin: string = `${domainServer}/videos`

export const client_origin: string = `${protocol}://${hostname}:${port_client}`
