import { futureDateFromNow } from "../utilities"
import * as _ from "lodash"

/**
 * IAccessLocker is an interface that used to create a locker for login.
 */
export interface IAccessLocker {

    /**
     * Max number of attempt that a user can do for login.
     */
    maxAttempts: number

    /**
     * Waiting time (in minutes) after which user can try login again.
     */
    tryAgainInMinutes: number

    /**
     * Insert an ip in the white list of user' IPs.
     * @param ip address associated with a user.
     */
    insert: (ip: string) => void

    /**
     * @param ip address associated with a user.
     * @return true if user has enough login attempts left, otherwise false.
     */
    checkAttempts: (ip: string) => boolean

    /**
     * Remove a login attempts to a user with the passed ip.
     * @param ip address associated with a user.
     */
    reduceAttempts: (ip: string) => void

    /**
     * Restore the login attempts of a user with the passed ip.
     * @param ip address associated with a user.
     */
    resetAttempts: (ip: string) => void

    /**
     * @param ip address associated with a user.
     * @return the remaining login attempts of a user with the passed ip.
     */
    getRemainAttempts: (ip: string) => number
}
type LockerType = {
    /**
     * Number of attempts left.
     */
    number: number
    /**
     * Future time after which user can try login again.
     */
    again: number
}

/**
 * An implementation of {@link IAccessLocker}.
 */
export class AccessLocker implements IAccessLocker {
    private readonly MAX_ATTEMPTS_DEFAULT: number = 3
    private readonly TRY_AGAIN_DEFAULT: number = 30

    readonly _maxAttempts: number
    readonly _tryAgainInMinutes: number
    private _ips = {}

    constructor(maxAttempts?: number, tryAgainInMinutes?: number) {
        this._maxAttempts = maxAttempts || this.MAX_ATTEMPTS_DEFAULT
        this._tryAgainInMinutes = tryAgainInMinutes || this.TRY_AGAIN_DEFAULT
    }

    get maxAttempts() {
        return this._maxAttempts
    }

    get tryAgainInMinutes() {
        return this._tryAgainInMinutes
    }

    insert(ip: string): void {
        if (!_.hasIn(this._ips, ip)) this._ips[ip] = <LockerType> { number: 0, again: 0 }
    }

    checkAttempts(ip: string): boolean {
        this.insert(ip)
        return !this.isMaxOrHighAttempts(ip) || this.isTimeToTryAgain(ip)
    }

    reduceAttempts(ip: string): void {
        if (this._ips[ip]) {
            if (this.isTimeToTryAgain(ip)) {
                this._ips[ip] = <LockerType> { number: 0, again: 0 }
                console.debug(`Auto Reset attempts access. -> [ ${JSON.stringify(this._ips)} ]`)
            }
            this._ips[ip].number = this._ips[ip].number + 1
            if (this.isMaxAttempts(ip)) this._ips[ip].again = futureDateFromNow(this._tryAgainInMinutes)
            console.debug(`Access attempt made. -> ( ${ip} = ${JSON.stringify(this._ips[ip])} )`)
        }
    }

    resetAttempts(ip: string): void {
        delete this._ips[ip]
        console.debug(`Manual reset attempts access. -> [ ${JSON.stringify(this._ips)} ]`)
    }

    getRemainAttempts(ip: string): number {
        return this._maxAttempts - (this._ips[ip]?.number || this._maxAttempts)
    }

    getTryAgainInMinutes(ip: string): number {
        const now = Date.now()
        return new Date((this._ips[ip]?.again || now) - now).getMinutes()
    }

    private isMaxAttempts(ip: string): boolean {
        return this._ips[ip]?.number === this._maxAttempts
    }

    private isMaxOrHighAttempts(ip: string): boolean {
        return this._ips[ip]?.number >= this._maxAttempts
    }

    private isTimeToTryAgain(ip: string): boolean {
        return this.isMaxOrHighAttempts(ip) && this._ips[ip]?.again < Date.now()
    }
}
