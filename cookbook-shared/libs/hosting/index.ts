import {Application} from "express";
import * as http from "http";
import * as https from "https";

/**
 * Type of option of the https server.
 */
export type HTTPSOptions = {
    key: Buffer,
    cert: Buffer
}

/**
 * Builder of http/s server.
 */
export class Hosting {
    protocol: string
    hostname: string = "localhost"
    port: number

    optHttps: () => HTTPSOptions

    private readonly app: Application = null
    private instanceServer: http.Server | https.Server
    private socket: (server: http.Server | https.Server) => void

    private unchangeables: Set<string> = new Set<string>()

    constructor(app: Application) {
        this.app = app
    }

    /**
     * Set a server transmission protocol.
     * @param p transmission protocol of the server.
     * @param unchangeable if true, it is not possible to modify the protocol previously set.
     * @return an instance of Hosting class.
     */
    setProtocol(p: string, unchangeable?: boolean): this {
        this.check("Protocol", unchangeable)
        this.protocol = p
        return this
    }

    /**
     * Set a https server options {@link HTTPSOptions}.
     * @param optHttps callback that returns https options.
     * @param unchangeable if true, it is not possible to modify the https options previously set.
     * @return an instance of Hosting class.
     */
    setHttpsOptions(optHttps: () => HTTPSOptions, unchangeable?: boolean): this {
        this.check("HttpsOptions", unchangeable)
        this.optHttps = optHttps
        return this
    }

    /**
     * Set a server hostname.
     * @param h name of the server host.
     * @return an instance of Hosting class.
     */
    setHostName(h: string): this {
        this.hostname = h
        return this
    }

    /**
     * Set a server port.
     * @param p port on listening server.
     * @return an instance of Hosting class.
     */
    setPort(p: number): this {
        this.port = p
        return this
    }

    /**
     * Set a callbacks that registering event handlers on sockets.
     * @param socket callbacks for setting sockets events.
     * @return an instance of Hosting class.
     *
     * @example
     * setSocket(httpsServer => {
     *     let io: Server = new Server(httpsServer, {...}) // 'Server' is a class of 'socket.io'.
     *     io.on('connection', socket => {
     *         console.log("User is connected.")
     *
     *         socket.on("some-event", socket => {
     *             console.log("Handler event 'some-event'")
     *         })
     *     })
     * })
     */
    setSocket(socket: (server: http.Server | https.Server) => void): this {
        this.socket = socket
        return this
    }

    /**
     * Build the server instance.
     * @return an instance of Hosting class.
     */
    build(): this {
        if(!this.port) throw new Error("Hosting: You must set port.")
        if(!this.protocol) this.protocol = this.optHttps ? "https" : "http"

        switch (this.protocol) {
            case "http":
            {
                const http = require('http');
                this.instanceServer = http.createServer(this.app);
            }
                break;
            case "https":
            {
                const https = require('https');
                if(!this.optHttps || typeof this.optHttps !== "function") throw new Error("No HTTPS protocol certificate is set.")
                this.instanceServer = https.createServer(this.optHttps(), this.app)
            }
                break
        }

        if(this.socket && typeof this.socket === 'function') {
            this.socket(this.instanceServer)
        }

        return this
    }

    /**
     * Start a server listening for connections.
     * @param callback function that will be called after the `'Listening'` event.
     */
    listen(callback?: (hosting: Hosting) => void): void{
        this.instanceServer.listen(this.port, () => callback?.call(null, this));
    }

    /**
     * @return instance of server
     */
    get server(): http.Server | https.Server {
        return this.instanceServer
    }

    /**
     * @return URL of the server
     */
    get origin(): string {
        return `${this.protocol}://${this.hostname}:${this.port}`
    }

    private check(valueOf: string, unchangeable: boolean): void | never {
        let _value: any
        switch (valueOf){
            case "HttpsOptions":
                _value = this.optHttps;
                break
            case "Protocol":
                _value = this.protocol;
                break
        }
        if(unchangeable) this.unchangeables.add(valueOf)
        if(this.unchangeables.has(valueOf) && _value)
            throw new Error(`'${valueOf}' is already set. ${valueOf} = ${_value}`)
    }
}

export namespace Hosting {

    /**
     * @param app instance of express app
     * @return an instance of http/s server builder.
     */
    export function create(app: Application): Hosting {
        return new Hosting(app)
    }

    /**
     * @param app instance of express app
     * @param options some options regarding the https server
     * @return an HTTPS Server builder.
     */
    export function createHttpsServer(app: Application, options: HTTPSOptions): Hosting {
        return new Hosting(app)
                    .setHttpsOptions(() => options, true)
                    .setProtocol("https", true)
    }

    /**
     * @param app instance of express app
     * @return an HTTP Server builder.
     */
    export function createHttpServer(app: Application): Hosting {
        return new Hosting(app).setProtocol("http", true)
    }
}
