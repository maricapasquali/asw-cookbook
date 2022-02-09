import {sign, verify, decode} from 'jsonwebtoken'
import * as fs from "fs";
import * as path from "path";

import * as config from "../../../env.config"

const server_api_origin = config.server["sub-domain"].api
const client_origin = config.client.origin

export type DecodedTokenType = { _id: string, role: string }

export interface IJwtToken {
    createNewTokens(data: object): {access: string, refresh: string}
    createToken(data: object, timeout?: string): string
    checkValidityOfToken(token: string): DecodedTokenType | false
    getDecodedToken(token: string): object
    areTheSame(actual_token: string, expected_token: string): boolean
}

export class JwtToken implements IJwtToken {
    private readonly privateKey;
    private readonly signOptions;
    constructor() {
        this.privateKey = fs.readFileSync(path.join(__dirname, 'private.key'))
        this.signOptions = {
            algorithm: "HS512",
            header: {
                typ: "JWT",
            },
            audience: client_origin,
            issuer: server_api_origin
        }
    }

    createNewTokens(data: object): { access: string; refresh: string } {
        console.debug('Create new token.')
        return  {
            access: this.createToken(data),
            refresh: this.createToken(data, "1 days")
        }
    }

    createToken(data: object, timeout?: string): string {
        return sign(data, this.privateKey, Object.assign({expiresIn: timeout || "30 minutes"}, this.signOptions))
    }

    checkValidityOfToken(token: string): DecodedTokenType | false {
        console.debug('Verify token.')
        try {
            return verify(token, this.privateKey)
        }catch (e){
            console.error(e)
            return false
        }
    }

    getDecodedToken(token: string): object {
        console.debug('Decoded token.')
        return decode(token, this.privateKey)
    }

    areTheSame(actual_token: string, expected_token: string): boolean {
        return actual_token === expected_token
    }
}
