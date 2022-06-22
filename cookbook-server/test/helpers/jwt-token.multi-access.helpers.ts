import { Types } from "mongoose"
import { expect } from "chai"
import * as assert from "assert"
import {
    IJwtTokensManager,
    Tokens
} from "../../src/libs/jwt.token"

/* -- EXPORTED FUNCTIONALITY -- */

export const PROPERTY_TOKEN_ACCESS = "access"

export const PROPERTY_TOKEN_REFRESH = "refresh"

export const CHECKER_LIST_ALL = "all"

export const CHECKER_LIST_SOME = "contain"

export const user1 = {
    _id: Types.ObjectId()
        .toString(),
    userID: "mario",
    role: "signed"
}
export const user2 = {
    _id: Types.ObjectId()
        .toString(),
    userID: "carlo",
    role: "signed"
}

// - actions
export function loginInDevice1(tokenManager: IJwtTokensManager, token1Dev1: Tokens, token2Dev1: Tokens): void {
    tokenManager.tokens(user1._id)
        .append(token1Dev1)
    tokenManager.tokens(user2._id)
        .append(token2Dev1)
    console.debug("Login in device 1.")
}

export function loginInDevice2(tokenManager: IJwtTokensManager, token1Dev2: Tokens, token2Dev2: Tokens): void {
    tokenManager.tokens(user1._id)
        .append(token1Dev2)
    tokenManager.tokens(user2._id)
        .append(token2Dev2)
    console.debug("Login in device 2.")
}

export function logoutInDevice1(tokenManager: IJwtTokensManager, token1Dev1: Tokens, token2Dev1: Tokens): void {
    tokenManager.tokens(user1._id)
        .revoke({ access: token1Dev1.access })
    tokenManager.tokens(user2._id)
        .revoke({ access: token2Dev1.access })
    console.debug("Logout from device 1.")
}

export function logoutInDevice2(tokenManager: IJwtTokensManager, token1Dev2: Tokens, token2Dev2: Tokens): void {
    tokenManager.tokens(user1._id)
        .revoke({ access: token1Dev2.access })
    tokenManager.tokens(user2._id)
        .revoke({ access: token2Dev2.access })
    console.debug("Logout from device 2.")
}

export function updateAccessTokenInDevice1(tokenManager: IJwtTokensManager, token1Dev1: Tokens, token2Dev1: Tokens): any {
    const newToken1Dev1 = { access: tokenManager.createToken(user1), refresh: token1Dev1.refresh }
    const newToken2Dev1 = { access: tokenManager.createToken(user2), refresh: token2Dev1.refresh }
    tokenManager.tokens(user1._id)
        .refresh(token1Dev1, newToken1Dev1)
    tokenManager.tokens(user2._id)
        .refresh(token2Dev1, newToken2Dev1)
    console.debug("Update access token in device 1.")
    return {
        newToken1Dev1,
        newToken2Dev1
    }
}

// - print in standard output
export function printTokensList(tokenManager: IJwtTokensManager, message?: string): void {
    console.debug("------------- PRINT LIST ---------------")
    if (message) console.debug(message)
    console.debug(tokenManager.tokens(user1._id))
    console.debug(tokenManager.tokens(user2._id))
    console.debug("----------------------------------------")
}

// - checks
export function checkLengthTokensList(tokenManager: IJwtTokensManager, expected: number): void {
    expect(tokenManager.tokens(user1._id).list).to.have.lengthOf(expected)
    expect(tokenManager.tokens(user2._id).list).to.have.lengthOf(expected)
}

export function checkContent(tokenManager: IJwtTokensManager, checker: string, expected1: Tokens[], expected2: Tokens[]): void {
    const assertion1 = expect(tokenManager.tokens(user1._id).list).to
    const assertion2 = expect(tokenManager.tokens(user2._id).list).to
    switch (checker) {
        case CHECKER_LIST_SOME:
            assertion1.contain.members(expected1)
            assertion2.contain.members(expected2)
            break
        case CHECKER_LIST_ALL:
            assertion1.all.members(expected1)
            assertion2.all.members(expected2)
            break
        default:
            assert.fail("checker not valid")
    }
}

export function checkTokenValidity(tokenManager: IJwtTokensManager, tokens: Tokens[], typeToken, expected: boolean | any): void {
    for (const token of tokens) {
        const _specificToken = token[typeToken]
        if (expected === true) assert(tokenManager.checkValidityOfToken(_specificToken))
        else assert.equal(tokenManager.checkValidityOfToken(_specificToken), expected)
    }
}
