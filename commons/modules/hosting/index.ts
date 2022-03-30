import * as core from "express-serve-static-core";
import * as http from "http";
import * as https from "https";

export class Hosting {
    protocol: string
    hostname: string = "localhost"
    port: number

    optHttps: () => { key: Buffer, cert: Buffer }

    private readonly app = null
    private instanceServer: http.Server | https.Server
    private socket: (server: http.Server | https.Server) => void

    constructor(app: core.Express) {
        this.app = app
    }

    setProtocol(p: string): Hosting {
        this.protocol = p
        return this
    }
    setHttpsOptions(optHttps: () => { key: Buffer, cert: Buffer}){
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

    setSocket(socket: (server: http.Server | https.Server) => void) {
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

    get origin(){
        return `${this.protocol}://${this.hostname}:${this.port}`
    }
}
