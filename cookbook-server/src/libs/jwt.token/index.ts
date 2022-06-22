import {
    decode,
    sign,
    verify
} from "jsonwebtoken"
import * as fs from "fs"
import * as path from "path"
import * as _ from "lodash"

export type DecodedTokenType = {
    /**
     * User identifier
     */
    _id: string
    /**
     * Username
     */
    userID: string
    /**
     * User role in platform
     */
    role: string
    /**
     * Request identifier
     */
    reqId: string
}
type TokenPayload = DecodedTokenType | any

export type Tokens = {
    /**
     * Access token
     */
    access: string
    /**
     * Refresh token
     */
    refresh: string
}
type RevokeToken = Tokens | { access: string } | { refresh: string } | string

/**
 * IFolderTokens is an interface that manages operations concerning tokens of a specific user.
 */
export interface IFolderTokens {

    /**
     * User's identifier
     */
    id: string

    /**
     * List of user's tokens
     */
    list: Tokens[]

    /**
     * Add tokens in the list of tokens, if it is no present.
     * @param tokens to add.
     * @return true if operation is executed, otherwise false.
     */
    append: (tokens: Tokens) => boolean

    /**
     * Replace _old_ tokens with __new_ tokens if the old one is in tokens list.
     * @param old tokens to replace
     * @param _new new tokens that replace the old one
     * @return true if operation is executed, otherwise false.
     */
    refresh: (old: Tokens, _new: Tokens) => boolean

    /**
     * Remove _token_ from tokens list if it is present.
     * @param token to remove.
     * @return true if operation is executed, otherwise false.
     */
    revoke: (token: RevokeToken) => boolean

    /**
     * Clean the tokens list of user.
     * @return true if operation is executed, otherwise false.
     */
    revokeAll: () => boolean

    /**
     * @param token to check.
     * @return true if token is not in tokens list, otherwise false.
     */
    isRevoked: (token: RevokeToken) => boolean

    /**
     * @param refresh token as a filter
     * @return access token if refresh token is in tokens list, otherwise undefined.
     */
    findAccessTokenByRefreshToken: (refresh: string) => string
}

/**
 * An implementation of {@link IFolderTokens}.
 */
class FolderTokens implements IFolderTokens {
    private readonly _id: string
    private readonly _whiteList: Tokens[]

    constructor(id: string) {
        this._id = id
        this._whiteList = []
    }

    get id() {
        return this._id
    }

    get list(): Tokens[] {
        return this._whiteList
    }

    append(tokens: Tokens): boolean {
        const len = this._whiteList.length
        return !this._found(tokens) && this._whiteList.push(tokens) === len + 1
    }

    isRevoked(token: RevokeToken): boolean {
        return !this._found(token)
    }

    refresh(old: Tokens, _new: Tokens): boolean {
        const _tokenIndex = this._index(old)
        return _tokenIndex !== -1 && this._whiteList.splice(_tokenIndex, 1, _new).length === 1
    }

    revoke(token: RevokeToken): boolean {
        const _tokenIndex = this._index(token)
        return _tokenIndex !== -1 && this._whiteList.splice(_tokenIndex, 1).length === 1
    }

    revokeAll(): boolean {
        const len = this._whiteList.length
        return this._whiteList.splice(0).length === len
    }

    findAccessTokenByRefreshToken(refresh: string): string {
        const _index = this._index({ refresh })
        if (_index !== -1) return this._whiteList[_index].access
    }

    private _index(token: RevokeToken) {
        let _tokenIndex
        if (typeof token === "string") _tokenIndex = this._whiteList.findIndex(t => t.refresh === token || t.access === token)
        else _tokenIndex = _.findIndex(this._whiteList, token)
        return _tokenIndex
    }

    private _found(token: RevokeToken) {
        return this._index(token) !== -1
    }
}

/**
 * IJwtTokensManager is an interface that manages operations concerning JSON Web Token.
 */
export interface IJwtTokensManager {

    /**
     * @param data payload (additional data) of jwt token
     * @return a pair of encoded JSON Web Token that represent access token and refresh token.
     */
    createNewTokens: (data: TokenPayload) => Tokens

    /**
     * @param data payload (additional data) of jwt token
     * @param timeout (optional) expiration interval. If not set, the token never expires.
     * @return Encoded JSON Web Token
     */
    createToken: (data: TokenPayload, timeout?: string) => string

    /**
     * @param token to check
     * @return true if _token_ is expired (i.e it is no more valid), otherwise false.
     */
    isExpired: (token: string) => boolean

    /**
     * @param token to check and/or decode
     * @return Decoded JSON Web Token if _token_ is valid, otherwise false.
     */
    checkValidityOfToken: (token: string) => DecodedTokenType | false

    /**
     * @param token JSON Web Token (jwt) string
     * @return Decoded JSON Web Token
     */
    decodedToken: (token: string) => DecodedTokenType

    /**
     * @param id user identifier
     * @return instance of {@link IFolderTokens}
     */
    tokens: (id: string) => IFolderTokens
}

/**
 * An implementation of {@link IJwtTokensManager}.
 */
export class JwtTokensManager implements IJwtTokensManager {
    private readonly privateKey: any
    private readonly publicKey: any
    private readonly signOptions: JwtTokensManager.TokenSignOptions

    private readonly _tokens: IFolderTokens[]

    constructor(audience: string, issuer: string) {
        this._tokens = []

        this.publicKey = fs.readFileSync(path.resolve("sslcert", "cert.pem"))
        this.privateKey = fs.readFileSync(path.resolve("sslcert", "privatekey.pem"))
        this.signOptions = {
            algorithm: "RS256",
            header: {
                typ: "JWT"
            },
            audience,
            issuer
        }
    }

    createNewTokens(data: TokenPayload): Tokens {
        console.debug("Create new token.")
        return {
            access: this.createToken(data),
            refresh: this.createToken(data, "1 days")
        }
    }

    createToken(data: TokenPayload, timeout = "30 minutes"): string {
        return sign(data, this.privateKey, Object.assign({ expiresIn: timeout }, this.signOptions))
    }

    isExpired(token: string): boolean {
        try {
            return !verify(token, this.publicKey)
        } catch (e) {
            console.error(e)
            return true
        }
    }

    checkValidityOfToken(token: string): DecodedTokenType | false {
        console.debug("Verify token...")
        try {
            const decodedToken: DecodedTokenType = this.decodedToken(token)
            return !!decodedToken && !this.tokens(decodedToken._id).isRevoked(token) && verify(token, this.publicKey)
        } catch (e) {
            console.error(e)
            return false
        }
    }

    decodedToken(token: string): DecodedTokenType {
        return decode(token, this.publicKey)
    }

    tokens(id: string): IFolderTokens {
        let _folderTokens = _.find(this._tokens, { _id: id })
        if (_folderTokens) return _folderTokens
        _folderTokens = new FolderTokens(id)
        this._tokens.push(_folderTokens)
        return _folderTokens
    }
}

namespace JwtTokensManager {
    export type TokenSignOptions = {
        /**
         * Signature or encryption algorithm
         */
        algorithm: string
        header: {
            /**
             * Type of token
             */
            typ: string
        }
        /**
         * Who or what the token is intended for
         */
        audience: string
        /**
         * Who created and signed the token
         */
        issuer: string
        /**
         * (Optional) Expiration time
         */
        expiresIn?: string
    }
}
