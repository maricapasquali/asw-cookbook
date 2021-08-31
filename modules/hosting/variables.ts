export const protocol: string = "https"
export const hostname: string = "localhost"
export const port_server: number = 3000
export const port_client: number = 5000
export const server_origin: string = `${protocol}://${hostname}:${port_server}/api`
export const images_origin: string = `${protocol}://${hostname}:${port_server}/images`

export const client_origin: string = `${protocol}://${hostname}:${port_client}`
