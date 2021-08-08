import * as core from "express-serve-static-core";
import * as http from "http";
import * as https from "https";

import * as variables from './variables'

export class Hosting {
    protocol: string = variables.protocol
    hostname: string = variables.hostname
    port: number

    optHttps: () => { key:string, cert: string }

    private readonly app = null
    private instanceServer: http.Server | https.Server

    constructor(app: core.Express) {
        this.app = app
    }

    setProtocol(p: string): Hosting {
        this.protocol = p
        return this
    }
    setHttpsOptions(optHttps: () => { key:string, cert: string}){
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

    build(): Hosting {
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
        return this
    }

    listen(callback: (hosting: Hosting) => void): void{
        this.instanceServer.listen(this.port, () => callback(this));
    }
}
