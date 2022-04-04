import {sign, verify, decode} from 'jsonwebtoken'
import * as fs from "fs";
import * as path from "path";
import * as _ from "lodash"

export type DecodedTokenType = { _id: string, role: string }
type TokenPayload = DecodedTokenType | any

type Tokens = { access: string, refresh: string }
type RevokeToken = Tokens | { access: string } | { refresh: string } | string

export interface IFolderTokens {
    id: string
    list: Tokens[]
    append(tokens: Tokens): boolean
    refresh(old: Tokens, _new: Tokens): boolean
    revoke(token: RevokeToken): boolean
    revokeAll(id: string): boolean
    isRevoked(token: RevokeToken): boolean
    findAccessTokenByRefreshToken(refresh: string): string
}

class FolderTokens implements IFolderTokens {
    private readonly _id: string
    private readonly _whiteList: Tokens[]

    constructor(id: string) {
        this._id = id
        this._whiteList = []
    }

    get id(){
        return this._id
    }

    get list(): Tokens[] {
        return this._whiteList;
    }

    append(tokens: Tokens): boolean {
        let len = this._whiteList.length
        return !this._found(tokens) && this._whiteList.push(tokens) === len + 1
    }

    isRevoked(token: RevokeToken): boolean {
        return !this._found(token)
    }

    refresh(old: Tokens, _new: Tokens): boolean {
        let _tokenIndex = this._index(old)
        return _tokenIndex !== -1 && this._whiteList.splice(_tokenIndex, 1, _new).length === 1
    }

    revoke(token: RevokeToken): boolean {
        let _tokenIndex = this._index(token)
        return _tokenIndex !== -1 && this._whiteList.splice(_tokenIndex, 1).length === 1
    }

    revokeAll(id: string): boolean {
        let len = this._whiteList.length
        return this._whiteList.splice(0).length === len
    }

    findAccessTokenByRefreshToken(refresh: string): string {
        let _index = this._index({refresh})
        if(_index !== -1) return this._whiteList[_index].access
    }

    private _index(token: RevokeToken){
        let _tokenIndex
        if(typeof token === 'string') _tokenIndex = this._whiteList.findIndex(t => t.refresh === token || t.access === token)
        else _tokenIndex = _.findIndex(this._whiteList, token)
        return _tokenIndex
    }

    private _found(token: RevokeToken){
        return this._index(token) !== -1
    }
}

export interface IJwtTokensManager {
    createNewTokens(data: TokenPayload): Tokens
    createToken(data: TokenPayload, timeout?: string): string
    isExpired(token: string): boolean
    checkValidityOfToken(token: string): DecodedTokenType | false
    getDecodedToken(token: string): DecodedTokenType

    tokens(id: string): IFolderTokens
}

export class JwtTokensManager implements IJwtTokensManager {
    private readonly privateKey;
    private readonly signOptions;

    private readonly _tokens: IFolderTokens[]

    constructor(audience: string, issuer: string) {
        this._tokens = []

        this.privateKey = fs.readFileSync(path.join(__dirname, 'private.key'))
        this.signOptions = {
            algorithm: "HS512",
            header: {
                typ: "JWT",
            },
            audience,
            issuer
        }
    }

    createNewTokens(data: TokenPayload): Tokens {
        console.debug('Create new token.')
        return  {
            access: this.createToken(data),
            refresh: this.createToken(data, "1 days")
        }
    }

    createToken(data: TokenPayload, timeout?: string): string {
        return sign(data, this.privateKey, Object.assign({expiresIn: timeout || "30 minutes"}, this.signOptions))
    }

    isExpired(token: string): boolean {
        try {
            return !verify(token, this.privateKey)
        }catch (e){
            console.error(e)
            return true
        }
    }

    checkValidityOfToken(token: string): DecodedTokenType | false {
        console.debug('Verify token...')
        try {
            let decodedToken: DecodedTokenType = this.getDecodedToken(token)
            return decodedToken && !this.tokens(decodedToken._id).isRevoked(token) && verify(token, this.privateKey)
        }catch (e){
            console.error(e)
            return false
        }
    }

    getDecodedToken(token: string): DecodedTokenType {
        return decode(token, this.privateKey)
    }

    tokens(id: string): IFolderTokens {
        let _folderTokens = _.find(this._tokens, {_id: id})
        if(_folderTokens) return _folderTokens
        _folderTokens = new FolderTokens(id)
        this._tokens.push(_folderTokens)
        return _folderTokens
    }
}
