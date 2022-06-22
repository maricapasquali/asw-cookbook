import { should } from "chai"
import {
    convertInSeconds,
    MINUTE_IN_MS,
    MINUTE_IN_SEC,
    sleep
} from "../helpers"
import {
    ip1,
    maxNumberAttempt,
    tryAgainAfter,
    tryAgainSeconds
} from "../helpers/access-locker.helpers"
import {
    AccessLocker,
    IAccessLocker
} from "../../src/libs/access.locker"

should()

describe("AccessLocker", function () {
    this.timeout(MINUTE_IN_MS)

    let locker: IAccessLocker

    beforeEach(() => {
        locker = new AccessLocker(maxNumberAttempt, tryAgainSeconds / MINUTE_IN_SEC)
        locker.insert(ip1)
    })

    it("User attempts to access", () => {
        locker.checkAttempts(ip1).should.be.true
        for (let i = 1; i <= maxNumberAttempt + 2; i++) {
            locker.reduceAttempts(ip1)
            if (i < maxNumberAttempt) locker.checkAttempts(ip1).should.be.true
            else locker.checkAttempts(ip1).should.be.false
        }
    })

    it("User tries again to access after some time", async () => {
        for (let i = 1; i <= maxNumberAttempt + 3; i++) locker.reduceAttempts(ip1)
        locker.checkAttempts(ip1).should.be.false
        const _tryAgainSeconds = tryAgainAfter()

        console.debug(`User must be wait at least ${convertInSeconds(locker.tryAgainInMinutes)} seconds before try again.`)
        console.debug(".......")

        await sleep(_tryAgainSeconds)
        console.debug(`After ${_tryAgainSeconds} seconds `)
        locker.checkAttempts(ip1).should.be.true

        console.debug("User can try again.")
        locker.reduceAttempts(ip1)
    })
})
