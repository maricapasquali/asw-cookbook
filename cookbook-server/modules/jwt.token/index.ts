import {sign, verify, decode} from 'jsonwebtoken'
import * as fs from "fs";
import * as path from "path";

import {server_origin, client_origin} from "../../../modules/hosting/variables";

export interface IJwtToken {
    createNewTokens(data: object): {access: string, refresh: string}
    checkValidityOfToken(token: string): {_id: string, role: string} | false
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
            issuer: server_origin
        }
    }

    createNewTokens(data: object): { access: string; refresh: string } {
        console.debug('Create new token.')
        return  {
            access: sign(data, this.privateKey, Object.assign({expiresIn: "30 minutes"}, this.signOptions)),
            refresh: sign(data, this.privateKey, Object.assign({expiresIn: "1 days"}, this.signOptions)),
        }
    }

    checkValidityOfToken(token: string): {_id: string, role: string} | false {
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
