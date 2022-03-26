const assert = require('assert');
const expect = require("chai").expect
const should = require("chai").should()
const {Types} = require("mongoose")
const {v4} = require("uuid")

const {RBAC} = require("../modules/rbac")
const {AccessLocker} = require("../modules/access.locker")
const {JwtTokensManager} = require("../modules/jwt.token")

describe('RBAC', function (){
    const accessManager = new RBAC()
    const admin = RBAC.Role.ADMIN.toString()
    const signed = RBAC.Role.SIGNED.toString()

    describe('Authorization', function (){

        it('should return true when the user has role ADMIN and deletes some user', function() {
            assert(accessManager.isAuthorized(admin, RBAC.Operation.DELETE, RBAC.Subject.USER, true))
        })
        it('should return false when the user has role SIGNED and deletes users', function() {
            assert(!accessManager.isAuthorized(signed, RBAC.Operation.DELETE, RBAC.Subject.USER, true))
        })
        it('should return true when the user has role SIGNED and deletes his account', function() {
            assert(accessManager.isAuthorized(signed, RBAC.Operation.DELETE, RBAC.Subject.USER, false))
        })
        it('should return true when the user has role SIGNED and deletes his account', function() {
            assert(accessManager.isAuthorized(signed, RBAC.Operation.DELETE, RBAC.Subject.USER))
        })
    })
    describe('User', function (){
        const user = {_id: '', role: admin}
        const user1 = {_id: '', role: signed}
        it('is admin', function() {
            assert(accessManager.isAdminUser(user))
        })
        it('is signed', function() {
            assert(accessManager.isSignedUser(user1))
        })
    })
})

describe('AccessLocker', function (){

    const SECOND_IN_MS = 1000
    const MINUTE_IN_SEC = 60
    const MINUTE_IN_MS = MINUTE_IN_SEC * SECOND_IN_MS

    const ip1 = '::1'
    const attempt = 4
    const tryAgainSeconds = 30

    this.timeout(MINUTE_IN_MS);

    const sleep = (seconds) => new Promise(resolve => setTimeout(resolve, seconds * SECOND_IN_MS))

    const locker = new AccessLocker(attempt, tryAgainSeconds / MINUTE_IN_SEC)
    locker.insert(ip1)

    it('User tries to access ', async function (){
        assert(locker.checkAttempts(ip1))

        locker.reduceAttempts(ip1)
        assert(locker.checkAttempts(ip1))

        locker.reduceAttempts(ip1)
        assert(locker.checkAttempts(ip1))

        locker.reduceAttempts(ip1)
        assert(locker.checkAttempts(ip1))

        locker.reduceAttempts(ip1)
        assert(!locker.checkAttempts(ip1))
        console.debug(`User must be wait ${tryAgainSeconds} seconds before try again.`)
        console.debug('.......')
        await sleep(tryAgainSeconds)
        console.debug(`After ${tryAgainSeconds} seconds `);

        assert(locker.checkAttempts(ip1))
        console.debug('User can try again.')
        locker.reduceAttempts(ip1)
    })
})

describe('Jwt Token (Multi-Access)', function (){

    const DEVICE_1 = v4()
    const DEVICE_2 = v4()

    const PROPERTY_TOKEN_ACCESS = 'access'
    const PROPERTY_TOKEN_REFRESH = 'refresh'

    const CHECKER_LIST_ALL = 'all'
    const CHECKER_LIST_SOME = 'contain'

    const user1 = {
        _id: Types.ObjectId().toString(),
        userID: 'mario',
        role: 'signed'
    }
    const user2 = {
        _id: Types.ObjectId().toString(),
        userID: 'carlo',
        role: 'signed'
    }

    let tokenManager

    let token1_dev1
    let token2_dev1

    let token1_dev2
    let token2_dev2

    // - actions
    const loginInDevice1 = () => {
        tokenManager.tokens(user1._id).append(token1_dev1)
        tokenManager.tokens(user2._id).append(token2_dev1)
        console.debug('Login in device 1.')
    }

    const loginInDevice2 = () => {
        tokenManager.tokens(user1._id).append(token1_dev2)
        tokenManager.tokens(user2._id).append(token2_dev2)
        console.debug('Login in device 2.')
    }

    const logoutInDevice1 = () => {
        tokenManager.tokens(user1._id).revoke({access: token1_dev1.access})
        tokenManager.tokens(user2._id).revoke({access: token2_dev1.access})
        console.debug('Logout from device 1.')
    }

    const logoutInDevice2 = () => {
        tokenManager.tokens(user1._id).revoke({access: token1_dev2.access})
        tokenManager.tokens(user2._id).revoke({access: token2_dev2.access})
        console.debug('Logout from device 2.')
    }

    const updateAccessTokenInDevice1 = () => {
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
    // ---------------

    const printTokensList = (message) => {
        console.debug('------------- PRINT LIST ---------------')
        if(message) console.log(message)
        console.debug(tokenManager.tokens(user1._id))
        console.debug(tokenManager.tokens(user2._id))
        console.debug('----------------------------------------')
    }

    // - checks
    const checkLengthTokensList = (expected) => {
        tokenManager.tokens(user1._id).list.should.have.lengthOf(expected)
        tokenManager.tokens(user2._id).list.should.have.lengthOf(expected)
    }

    const checkContent = (checker, expected1, expected2) => {
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

    const checkTokenValidity = (device, typeToken, expected) => {
        let access1
        let access2

        switch (device){
            case DEVICE_1:
                access1 = token1_dev1[typeToken]
                access2 = token2_dev1[typeToken]
                break
            case DEVICE_2:
                access1 = token1_dev2[typeToken]
                access2 = token2_dev2[typeToken]
                break
            default:
                assert.fail('device not valid')
        }
        if(expected === true) {
            assert(tokenManager.checkValidityOfToken(access1))
            assert(tokenManager.checkValidityOfToken(access2))
        } else {
            assert.equal(tokenManager.checkValidityOfToken(access1), expected)
            assert.equal(tokenManager.checkValidityOfToken(access2), expected)
        }
    }
    // ---------------

    beforeEach(async function (){
        console.debug('----------------------------- SET ENVIRONMENTS ----------------------------')
        tokenManager = new JwtTokensManager('client', 'server')

        token1_dev1 = tokenManager.createNewTokens({...user1, device: DEVICE_1})
        token2_dev1 = tokenManager.createNewTokens({...user2, device: DEVICE_1})

        token1_dev2 = tokenManager.createNewTokens({...user1, device: DEVICE_2})
        token2_dev2 = tokenManager.createNewTokens({...user2, device: DEVICE_2})


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
            loginInDevice1()

            printTokensList()
            checkLengthTokensList(1)

            checkContent(CHECKER_LIST_ALL, [token1_dev1], [token2_dev1])

            checkTokenValidity(DEVICE_1, PROPERTY_TOKEN_ACCESS, true)
            checkTokenValidity(DEVICE_1, PROPERTY_TOKEN_REFRESH, true)
        })
        it('also in device 2', function (){
            loginInDevice1()
            loginInDevice2()

            printTokensList()
            checkLengthTokensList(2)

            checkContent(CHECKER_LIST_ALL, [token1_dev1, token1_dev2], [token2_dev1, token2_dev2])

            checkTokenValidity(DEVICE_1, PROPERTY_TOKEN_ACCESS, true)
            checkTokenValidity(DEVICE_1, PROPERTY_TOKEN_REFRESH, true)
            checkTokenValidity(DEVICE_2, PROPERTY_TOKEN_ACCESS, true)
            checkTokenValidity(DEVICE_2, PROPERTY_TOKEN_REFRESH, true)
        })
    })
    describe('users logout', function (){
        it('from device 2', function (){
            loginInDevice1()
            loginInDevice2()

            logoutInDevice2()

            printTokensList()
            checkLengthTokensList(1)

            checkContent(CHECKER_LIST_ALL, [token1_dev1], [token2_dev1])

            checkTokenValidity(DEVICE_1, PROPERTY_TOKEN_ACCESS, true)
            checkTokenValidity(DEVICE_1, PROPERTY_TOKEN_REFRESH, true)
            checkTokenValidity(DEVICE_2, PROPERTY_TOKEN_ACCESS, false)
            checkTokenValidity(DEVICE_2, PROPERTY_TOKEN_REFRESH, false)
        })
        it('from all devices', function (){
            loginInDevice1()
            loginInDevice2()

            logoutInDevice1()
            logoutInDevice2()

            printTokensList()

            checkTokenValidity(DEVICE_1, PROPERTY_TOKEN_ACCESS, false)
            checkTokenValidity(DEVICE_1, PROPERTY_TOKEN_REFRESH, false)
            checkTokenValidity(DEVICE_2, PROPERTY_TOKEN_ACCESS, false)
            checkTokenValidity(DEVICE_2, PROPERTY_TOKEN_REFRESH, false)
        })
    })

    describe('user refresh access token', function (){
        it('on device 1', function (){
            loginInDevice1()
            loginInDevice2()

            printTokensList('Before update:')

            let { new_token1_dev1, new_token2_dev1 } = updateAccessTokenInDevice1()

            printTokensList('After update:')

            checkContent(CHECKER_LIST_SOME, [new_token1_dev1], [new_token2_dev1])

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
            checkTokenValidity(DEVICE_1, PROPERTY_TOKEN_ACCESS, false)
            checkTokenValidity(DEVICE_1, PROPERTY_TOKEN_REFRESH, true)
        })
    })

})
