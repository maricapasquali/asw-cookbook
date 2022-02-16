const assert = require('assert');
const {EmailValidator, PasswordValidator} = require('../modules/validator')
const {RBAC} = require("../cookbook-server/modules/rbac");
const {AccessLocker} = require("../cookbook-server/modules/access.locker");

describe('Validator', function (){
    describe('Email', function() {
        it('should return false when the value is not valid', function() {
            assert.equal(EmailValidator.check('mario@'), false);
        });

        it('should return true when the value is valid', function() {
            assert.equal(EmailValidator.check('mario@gmail.com'), true);
        });
    });

    describe('Password ', function() {

        const pattern = 'at least 8 characters,' +
            ' min 1 Uppercase,' +
            ' min 1 Lowercase,' +
            ' min 1 Number,' +
            ' min 1 special character,' +
            ' only contains symbols from the alphabet, numbers and chosen special characters'

        it('should return false when the value does not have ' + pattern, function() {
            assert.equal(PasswordValidator.check('ciao'), false);
        });

        it('should return true when the value have' + pattern, function() {
            assert.equal(PasswordValidator.check('Ciao$111'), true);
        });

    });

})

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
    const MS = 1000
    const SEC = 60

    const ip1 = '::1'
    const attempt = 4
    const tryAgainMinutes = 0.5

    const sleep = (minutes) => new Promise(resolve => setTimeout(resolve, minutes*SEC*MS))

    this.timeout(SEC*MS);

    const locker = new AccessLocker(attempt, tryAgainMinutes)
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
        console.log(`User must be wait ${tryAgainMinutes} minutes before try again.`)
        console.log('.......')
        await sleep(tryAgainMinutes)
        console.log(`After ${tryAgainMinutes} minutes `);

        assert(locker.checkAttempts(ip1))
        console.log('User can try again.')
        locker.reduceAttempts(ip1)
    })
})