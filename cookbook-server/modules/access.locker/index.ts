import {futureDateFromNow, hasKey} from "../utilities";

export interface IAccessLocker {
    insert(ip: string): void
    checkAttempts(ip: string): boolean
    reduceAttempts(ip: string): void
    resetAttempts(ip: string, timeout?: boolean): void
    getRemainAttempts(ip: string): number
}
type LockerType = { number: number, again: number }
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


    insert(ip: string): void {
        if(!hasKey(this._ips, ip)) this._ips[ip] = <LockerType> { number: 0, again: 0 }
    }

    checkAttempts(ip: string): boolean {
        this.insert(ip)
        return !this.isMaxAttempts(ip) || this.isTimeToTryAgain(ip);
    }

    reduceAttempts(ip: string): void {
        if(this._ips[ip]){
            if(this.isTimeToTryAgain(ip)) this.resetAttempts(ip, true)
            this._ips[ip].number = this._ips[ip].number + 1
            if(this.isMaxAttempts(ip)) this._ips[ip].again = futureDateFromNow(this._tryAgainInMinutes)
            console.debug(`Access attempt made. -> ( ${ip} = ${JSON.stringify(this._ips[ip])} )`)
        }
    }

    resetAttempts(ip: string, timeout?: boolean): void {
        if(timeout) {
            if(this._ips[ip]) {
                this._ips[ip] = <LockerType> { number: 0, again: 0 }
                console.debug(`Reset attempts access with timeout  -> [ ${JSON.stringify(this._ips)} ]`)
            }
        } else {
            delete this._ips[ip]
            console.debug(`Reset attempts access.  -> [ ${JSON.stringify(this._ips)} ]`)
        }
    }

    getRemainAttempts(ip: string): number {
        return this._maxAttempts - (this._ips[ip]?.number || this._maxAttempts )
    }

    getTryAgainInMinutes(ip: string): number {
        let now = Date.now()
        return new Date((this._ips[ip]?.again || now) - now).getMinutes()
    }

    private isMaxAttempts(ip: string): boolean {
        return this._ips[ip]?.number >= this._maxAttempts
    }

    private isTimeToTryAgain(ip: string): boolean {
        return this.isMaxAttempts(ip) && this._ips[ip]?.again < Date.now()
    }
}
