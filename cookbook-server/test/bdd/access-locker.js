const should = require("chai").should();

const {
    MINUTE_IN_SEC,
    MINUTE_IN_MS,
    sleep,
    convertInSeconds
} = require("../helpers")
const {
    tryAgainSeconds,
    ip1,
    tryAgainAfter,
    maxNumberAttempt
} = require("../helpers/access-locker.helpers")
const {AccessLocker} = require("../../modules/access.locker");

describe('AccessLocker', function (){

    this.timeout(MINUTE_IN_MS);

    let locker

    beforeEach(function (){
        locker = new AccessLocker(maxNumberAttempt, tryAgainSeconds / MINUTE_IN_SEC)
            //getLocker()
        locker.insert(ip1)
    })

    it('User attempts to access', function (){
        locker.checkAttempts(ip1).should.be.true
        for(let i = 1 ; i <= maxNumberAttempt + 2; i++) {
            locker.reduceAttempts(ip1)
            if(i < maxNumberAttempt) locker.checkAttempts(ip1).should.be.true
            else locker.checkAttempts(ip1).should.be.false
        }
    })

    it('User tries again to access after some time', async function (){
        for(let i = 1 ; i <= maxNumberAttempt + 3; i++) locker.reduceAttempts(ip1)
        locker.checkAttempts(ip1).should.be.false
        const _tryAgainSeconds = tryAgainAfter()

        console.debug(`User must be wait at least ${convertInSeconds(locker.tryAgainInMinutes)} seconds before try again.`)
        console.debug('.......')

        await sleep(_tryAgainSeconds)
        console.debug(`After ${_tryAgainSeconds} seconds `);
        locker.checkAttempts(ip1).should.be.true

        console.debug('User can try again.')
        locker.reduceAttempts(ip1)
    })
})