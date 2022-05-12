const should = require("chai").should()
const {assert} = require("chai");
const {v4} = require("uuid")
const {JwtTokensManager} = require("../../modules/jwt.token")

const {
    CHECKER_LIST_ALL,
    CHECKER_LIST_SOME,
    PROPERTY_TOKEN_ACCESS,
    PROPERTY_TOKEN_REFRESH,
    user1,
    user2,

    loginInDevice1,
    loginInDevice2,
    logoutInDevice1,
    logoutInDevice2,
    printTokensList,
    checkLengthTokensList,
    checkContent,
    checkTokenValidity,
    updateAccessTokenInDevice1
} = require("../helpers/jwt-token.multi-access.helpers")


describe('Jwt Token (Multi-Access)', function (){

    let tokenManager
    let token1_dev1
    let token2_dev1
    let token1_dev2
    let token2_dev2

    before(function (){

        console.debug('----------------------------- SET ENVIRONMENTS ----------------------------')
        tokenManager = new JwtTokensManager('client', 'server')

        const device1 = v4()
        const device2 = v4()

        token1_dev1 = tokenManager.createNewTokens({...user1, device: device1})
        token2_dev1 = tokenManager.createNewTokens({...user2, device: device1})

        token1_dev2 = tokenManager.createNewTokens({...user1, device: device2})
        token2_dev2 = tokenManager.createNewTokens({...user2, device: device2})


        let _assertionMessage = 'Tokens in 2 device must be different'
        token1_dev1.should.not.equals(token1_dev2, _assertionMessage)
        token2_dev1.should.not.equals(token2_dev2, _assertionMessage)

        console.debug(`User (${user1._id}) generate tokens `)
        console.debug(` - device 1: ${JSON.stringify(token1_dev1)}`)
        console.debug(` - device 2: ${JSON.stringify(token1_dev2)}`)
        console.debug(`User (${user2._id}) generate tokens `)
        console.debug(` - device 1: ${JSON.stringify(token2_dev1)}`)
        console.debug(` - device 2: ${JSON.stringify(token2_dev2)}`)
        console.debug('--------------------------------------------------------------------------')

    })

    describe('users login', function (){
        it('in device 1', function (){

            loginInDevice1(tokenManager, token1_dev1, token2_dev1)

            printTokensList(tokenManager)
            checkLengthTokensList(tokenManager,1)

            checkContent(tokenManager, CHECKER_LIST_ALL, [token1_dev1], [token2_dev1])

            checkTokenValidity(tokenManager, [token1_dev1, token2_dev1], PROPERTY_TOKEN_ACCESS, true)
            checkTokenValidity(tokenManager, [token1_dev1, token2_dev1], PROPERTY_TOKEN_REFRESH, true)

        })
        it('also in device 2', function (){
            loginInDevice1(tokenManager, token1_dev1, token2_dev1)
            loginInDevice2(tokenManager, token1_dev2, token2_dev2)

            printTokensList(tokenManager)
            checkLengthTokensList(tokenManager, 2)

            checkContent(tokenManager, CHECKER_LIST_ALL, [token1_dev1, token1_dev2], [token2_dev1, token2_dev2])

            checkTokenValidity(tokenManager, [token1_dev1, token2_dev1], PROPERTY_TOKEN_ACCESS, true)
            checkTokenValidity(tokenManager, [token1_dev1, token2_dev1], PROPERTY_TOKEN_REFRESH, true)

            checkTokenValidity(tokenManager, [token1_dev2, token2_dev2], PROPERTY_TOKEN_ACCESS, true)
            checkTokenValidity(tokenManager, [token1_dev2, token2_dev2], PROPERTY_TOKEN_REFRESH, true)
        })
    })

    describe('users logout', function (){
        it('from device 2', function (){
            loginInDevice1(tokenManager, token1_dev1, token2_dev1)
            loginInDevice2(tokenManager, token1_dev2, token2_dev2)

            logoutInDevice2(tokenManager, token1_dev2, token2_dev2)

            printTokensList(tokenManager)
            checkLengthTokensList(tokenManager, 1)

            checkContent(tokenManager, CHECKER_LIST_ALL, [token1_dev1], [token2_dev1])


            checkTokenValidity(tokenManager, [token1_dev1, token2_dev1], PROPERTY_TOKEN_ACCESS, true)
            checkTokenValidity(tokenManager, [token1_dev1, token2_dev1], PROPERTY_TOKEN_REFRESH, true)

            checkTokenValidity(tokenManager, [token1_dev2, token2_dev2], PROPERTY_TOKEN_ACCESS, false)
            checkTokenValidity(tokenManager, [token1_dev2, token2_dev2], PROPERTY_TOKEN_REFRESH, false)
        })
        it('from all devices', function (){
            loginInDevice1(tokenManager, token1_dev1, token2_dev1)
            loginInDevice2(tokenManager, token1_dev2, token2_dev2)

            logoutInDevice1(tokenManager, token1_dev1, token2_dev1)
            logoutInDevice2(tokenManager, token1_dev2, token2_dev2)


            printTokensList(tokenManager)

            checkTokenValidity(tokenManager, [token1_dev1, token2_dev1], PROPERTY_TOKEN_ACCESS, false)
            checkTokenValidity(tokenManager, [token1_dev1, token2_dev1], PROPERTY_TOKEN_REFRESH, false)

            checkTokenValidity(tokenManager, [token1_dev2, token2_dev2], PROPERTY_TOKEN_ACCESS, false)
            checkTokenValidity(tokenManager, [token1_dev2, token2_dev2], PROPERTY_TOKEN_REFRESH, false)
        })
    })

    describe('user refresh access token', function (){
        it('on device 1', function (){
            loginInDevice1(tokenManager, token1_dev1, token2_dev1)
            loginInDevice2(tokenManager, token1_dev2, token2_dev2)

            printTokensList(tokenManager, 'Before update:')

            let { new_token1_dev1, new_token2_dev1 } = updateAccessTokenInDevice1(tokenManager, token1_dev1, token2_dev1)

            printTokensList(tokenManager, 'After update:')

            checkContent(tokenManager, CHECKER_LIST_SOME, [new_token1_dev1], [new_token2_dev1])

            assert.equal(new_token1_dev1.refresh, token1_dev1.refresh)
            assert.notEqual(new_token1_dev1.access, token1_dev1.access)

            assert.equal(new_token2_dev1.refresh, token2_dev1.refresh)
            assert.notEqual(new_token2_dev1.access, token2_dev1.access)


            assert(tokenManager.tokens(user1._id).isRevoked(token1_dev1))
            assert(tokenManager.tokens(user2._id).isRevoked(user2._id, token2_dev1))
            assert(!tokenManager.tokens(user1._id).isRevoked(new_token1_dev1))
            assert(!tokenManager.tokens(user2._id).isRevoked(new_token2_dev1))

            assert(tokenManager.checkValidityOfToken(new_token1_dev1.access))
            assert(tokenManager.checkValidityOfToken(new_token2_dev1.access))

            checkTokenValidity(tokenManager, [token1_dev1, token2_dev1], PROPERTY_TOKEN_ACCESS, false)
            checkTokenValidity(tokenManager, [token1_dev1, token2_dev1], PROPERTY_TOKEN_REFRESH, true)
        })
    })

})
