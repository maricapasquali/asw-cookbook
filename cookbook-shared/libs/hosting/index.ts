import * as core from "express-serve-static-core";
import * as http from "http";
import * as https from "https";

export type HTTPSOptions = {
    key: Buffer,
    cert: Buffer
}

export class Hosting {
    protocol: string
    hostname: string = "localhost"
    port: number

    optHttps: () => HTTPSOptions

    private readonly app = null
    private instanceServer: http.Server | https.Server
    private socket: (server: http.Server | https.Server) => void

    private unchangeables: Set<string> = new Set<string>()

    constructor(app: core.Express) {
        this.app = app
    }

    private check(valueOf: string, unchangeable: boolean): void {
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

    setProtocol(p: string, unchangeable?: boolean): Hosting {
        this.check("Protocol", unchangeable)
        this.protocol = p
        return this
    }

    setHttpsOptions(optHttps: () => HTTPSOptions, unchangeable?: boolean): Hosting {
        this.check("HttpsOptions", unchangeable)
        this.optHttps = optHttps
        return this
    }

    setHostName(h: string): Hosting {
        this.hostname = h
        return this
    }

    setPort(p: number): Hosting {
        this.port = p
        return this
    }

    setSocket(socket: (server: http.Server | https.Server) => void): Hosting {
        this.socket = socket
        return this
    }

    build(): Hosting {
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

    listen(callback?: (hosting: Hosting) => void): void{
        this.instanceServer.listen(this.port, () => callback?.call(null, this));
    }

    get server(): http.Server | https.Server {
        return this.instanceServer
    }

    get origin(): string {
        return `${this.protocol}://${this.hostname}:${this.port}`
    }
}

export namespace Hosting {

    export function create(app: core.Express): Hosting {
        return new Hosting(app)
    }

    export function createHttpsServer(app: core.Express, options: HTTPSOptions): Hosting {
        return new Hosting(app)
                    .setHttpsOptions(() => options, true)
                    .setProtocol("https", true)
    }

    export function createHttpServer(app: core.Express): Hosting {
        return new Hosting(app).setProtocol("http", true)
    }
}