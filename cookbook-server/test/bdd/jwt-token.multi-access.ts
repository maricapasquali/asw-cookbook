import {
    assert,
    should
} from "chai"
import { v4 } from "uuid"
import {
    IJwtTokensManager,
    JwtTokensManager,
    Tokens
} from "../../src/libs/jwt.token"
import {
    checkContent,
    CHECKER_LIST_ALL,
    CHECKER_LIST_SOME,
    checkLengthTokensList,
    checkTokenValidity,
    loginInDevice1,
    loginInDevice2,
    logoutInDevice1,
    logoutInDevice2,
    printTokensList,
    PROPERTY_TOKEN_ACCESS,
    PROPERTY_TOKEN_REFRESH,
    updateAccessTokenInDevice1,
    user1,
    user2
} from "../helpers/jwt-token.multi-access.helpers"

should()

describe("Jwt Token (Multi-Access)", () => {
    let tokenManager: IJwtTokensManager
    let token1Dev1: Tokens
    let token2Dev1: Tokens
    let token1Dev2: Tokens
    let token2Dev2: Tokens

    before(() => {
        console.debug("----------------------------- SET ENVIRONMENTS ----------------------------")
        tokenManager = new JwtTokensManager("client", "server")

        const device1: string = v4()
        const device2: string = v4()

        token1Dev1 = tokenManager.createNewTokens({ ...user1, device: device1 })
        token2Dev1 = tokenManager.createNewTokens({ ...user2, device: device1 })

        token1Dev2 = tokenManager.createNewTokens({ ...user1, device: device2 })
        token2Dev2 = tokenManager.createNewTokens({ ...user2, device: device2 })

        const _assertionMessage = "Tokens in 2 device must be different"
        token1Dev1.should.not.equals(token1Dev2, _assertionMessage)
        token2Dev1.should.not.equals(token2Dev2, _assertionMessage)

        console.debug(`User (${user1._id}) generate tokens `)
        console.debug(` - device 1: ${JSON.stringify(token1Dev1)}`)
        console.debug(` - device 2: ${JSON.stringify(token1Dev2)}`)
        console.debug(`User (${user2._id}) generate tokens `)
        console.debug(` - device 1: ${JSON.stringify(token2Dev1)}`)
        console.debug(` - device 2: ${JSON.stringify(token2Dev2)}`)
        console.debug("--------------------------------------------------------------------------")
    })

    describe("users login", () => {
        it("in device 1", () => {
            loginInDevice1(tokenManager, token1Dev1, token2Dev1)

            printTokensList(tokenManager)
            checkLengthTokensList(tokenManager, 1)

            checkContent(tokenManager, CHECKER_LIST_ALL, [token1Dev1], [token2Dev1])

            checkTokenValidity(tokenManager, [token1Dev1, token2Dev1], PROPERTY_TOKEN_ACCESS, true)
            checkTokenValidity(tokenManager, [token1Dev1, token2Dev1], PROPERTY_TOKEN_REFRESH, true)
        })
        it("also in device 2", () => {
            loginInDevice1(tokenManager, token1Dev1, token2Dev1)
            loginInDevice2(tokenManager, token1Dev2, token2Dev2)

            printTokensList(tokenManager)
            checkLengthTokensList(tokenManager, 2)

            checkContent(tokenManager, CHECKER_LIST_ALL, [token1Dev1, token1Dev2], [token2Dev1, token2Dev2])

            checkTokenValidity(tokenManager, [token1Dev1, token2Dev1], PROPERTY_TOKEN_ACCESS, true)
            checkTokenValidity(tokenManager, [token1Dev1, token2Dev1], PROPERTY_TOKEN_REFRESH, true)

            checkTokenValidity(tokenManager, [token1Dev2, token2Dev2], PROPERTY_TOKEN_ACCESS, true)
            checkTokenValidity(tokenManager, [token1Dev2, token2Dev2], PROPERTY_TOKEN_REFRESH, true)
        })
    })

    describe("users logout", () => {
        it("from device 2", () => {
            loginInDevice1(tokenManager, token1Dev1, token2Dev1)
            loginInDevice2(tokenManager, token1Dev2, token2Dev2)

            logoutInDevice2(tokenManager, token1Dev2, token2Dev2)

            printTokensList(tokenManager)
            checkLengthTokensList(tokenManager, 1)

            checkContent(tokenManager, CHECKER_LIST_ALL, [token1Dev1], [token2Dev1])

            checkTokenValidity(tokenManager, [token1Dev1, token2Dev1], PROPERTY_TOKEN_ACCESS, true)
            checkTokenValidity(tokenManager, [token1Dev1, token2Dev1], PROPERTY_TOKEN_REFRESH, true)

            checkTokenValidity(tokenManager, [token1Dev2, token2Dev2], PROPERTY_TOKEN_ACCESS, false)
            checkTokenValidity(tokenManager, [token1Dev2, token2Dev2], PROPERTY_TOKEN_REFRESH, false)
        })
        it("from all devices", () => {
            loginInDevice1(tokenManager, token1Dev1, token2Dev1)
            loginInDevice2(tokenManager, token1Dev2, token2Dev2)

            logoutInDevice1(tokenManager, token1Dev1, token2Dev1)
            logoutInDevice2(tokenManager, token1Dev2, token2Dev2)

            printTokensList(tokenManager)

            checkTokenValidity(tokenManager, [token1Dev1, token2Dev1], PROPERTY_TOKEN_ACCESS, false)
            checkTokenValidity(tokenManager, [token1Dev1, token2Dev1], PROPERTY_TOKEN_REFRESH, false)

            checkTokenValidity(tokenManager, [token1Dev2, token2Dev2], PROPERTY_TOKEN_ACCESS, false)
            checkTokenValidity(tokenManager, [token1Dev2, token2Dev2], PROPERTY_TOKEN_REFRESH, false)
        })
    })

    describe("user refresh access token", () => {
        it("on device 1", () => {
            loginInDevice1(tokenManager, token1Dev1, token2Dev1)
            loginInDevice2(tokenManager, token1Dev2, token2Dev2)

            printTokensList(tokenManager, "Before update:")

            const { newToken1Dev1, newToken2Dev1 } = updateAccessTokenInDevice1(tokenManager, token1Dev1, token2Dev1)

            printTokensList(tokenManager, "After update:")

            checkContent(tokenManager, CHECKER_LIST_SOME, [newToken1Dev1], [newToken2Dev1])

            assert.equal(newToken1Dev1.refresh, token1Dev1.refresh)
            assert.notEqual(newToken1Dev1.access, token1Dev1.access)

            assert.equal(newToken2Dev1.refresh, token2Dev1.refresh)
            assert.notEqual(newToken2Dev1.access, token2Dev1.access)

            assert(tokenManager.tokens(user1._id).isRevoked(token1Dev1))
            assert(tokenManager.tokens(user2._id).isRevoked(token2Dev1))
            assert(!tokenManager.tokens(user1._id).isRevoked(newToken1Dev1))
            assert(!tokenManager.tokens(user2._id).isRevoked(newToken2Dev1))

            assert(tokenManager.checkValidityOfToken(newToken1Dev1.access))
            assert(tokenManager.checkValidityOfToken(newToken2Dev1.access))

            checkTokenValidity(tokenManager, [token1Dev1, token2Dev1], PROPERTY_TOKEN_ACCESS, false)
            checkTokenValidity(tokenManager, [token1Dev1, token2Dev1], PROPERTY_TOKEN_REFRESH, true)
        })
    })
})
