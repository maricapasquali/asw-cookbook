import {Types} from "mongoose";
import {expect} from "chai";
import * as assert from "assert";
import {JwtTokensManager, Tokens} from "../../modules/jwt.token";

/* -- EXPORTED FUNCTIONALITY -- */

export const PROPERTY_TOKEN_ACCESS = 'access'

export const PROPERTY_TOKEN_REFRESH = 'refresh'

export const CHECKER_LIST_ALL = 'all'

export const CHECKER_LIST_SOME = 'contain'

export const user1 = {
    _id: Types.ObjectId().toString(),
    userID: 'mario',
    role: 'signed'
}
export const user2 = {
    _id: Types.ObjectId().toString(),
    userID: 'carlo',
    role: 'signed'
}

// - actions
export const loginInDevice1 = (tokenManager: JwtTokensManager, token1_dev1: Tokens, token2_dev1: Tokens) => {
    tokenManager.tokens(user1._id).append(token1_dev1)
    tokenManager.tokens(user2._id).append(token2_dev1)
    console.debug('Login in device 1.')
}

export const loginInDevice2 = (tokenManager: JwtTokensManager, token1_dev2: Tokens, token2_dev2: Tokens) => {
    tokenManager.tokens(user1._id).append(token1_dev2)
    tokenManager.tokens(user2._id).append(token2_dev2)
    console.debug('Login in device 2.')
}

export const logoutInDevice1 = (tokenManager: JwtTokensManager, token1_dev1: Tokens, token2_dev1: Tokens) => {
    tokenManager.tokens(user1._id).revoke({access: token1_dev1.access})
    tokenManager.tokens(user2._id).revoke({access: token2_dev1.access})
    console.debug('Logout from device 1.')
}

export const logoutInDevice2 = (tokenManager: JwtTokensManager, token1_dev2: Tokens, token2_dev2: Tokens) => {
    tokenManager.tokens(user1._id).revoke({access: token1_dev2.access})
    tokenManager.tokens(user2._id).revoke({access: token2_dev2.access})
    console.debug('Logout from device 2.')
}

export const updateAccessTokenInDevice1 = (tokenManager: JwtTokensManager, token1_dev1: Tokens, token2_dev1: Tokens): any => {
    let new_token1_dev1 = { access: tokenManager.createToken(user1), refresh: token1_dev1.refresh }
    let new_token2_dev1 = { access: tokenManager.createToken(user2), refresh: token2_dev1.refresh }
    tokenManager.tokens(user1._id).refresh(token1_dev1, new_token1_dev1)
    tokenManager.tokens(user2._id).refresh(token2_dev1, new_token2_dev1)
    console.debug('Update access token in device 1.')
    return {
        new_token1_dev1,
        new_token2_dev1
    }
}

// - print in standard output
export const printTokensList = (tokenManager: JwtTokensManager, message?: string) => {
    console.debug('------------- PRINT LIST ---------------')
    if(message) console.debug(message)
    console.debug(tokenManager.tokens(user1._id))
    console.debug(tokenManager.tokens(user2._id))
    console.debug('----------------------------------------')
}

// - checks
export const checkLengthTokensList = (tokenManager: JwtTokensManager, expected: number) => {
    expect(tokenManager.tokens(user1._id).list).to.have.lengthOf(expected)
    expect(tokenManager.tokens(user2._id).list).to.have.lengthOf(expected)
}

export const checkContent = (tokenManager: JwtTokensManager, checker: string, expected1: Tokens[], expected2: Tokens[]) => {
    let assertion1 = expect(tokenManager.tokens(user1._id).list).to
    let assertion2 = expect(tokenManager.tokens(user2._id).list).to
    switch (checker){
        case CHECKER_LIST_SOME:
            assertion1.contain.members(expected1)
            assertion2.contain.members(expected2)
            break
        case CHECKER_LIST_ALL:
            assertion1.all.members(expected1)
            assertion2.all.members(expected2)
            break
        default:
            assert.fail('checker not valid')
    }
}

export const checkTokenValidity = (tokenManager: JwtTokensManager, tokens: Tokens[], typeToken, expected: boolean | any) => {
    for(let token of tokens){
        let _specificToken = token[typeToken]
        if(expected === true) assert(tokenManager.checkValidityOfToken(_specificToken))
        else assert.equal(tokenManager.checkValidityOfToken(_specificToken), expected)
    }
}
