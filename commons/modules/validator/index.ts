export interface Validator<T> {
    readonly regex: RegExp
    check(value: T): boolean
}

// EMAIL
export const EmailValidator: Validator<string> = new class implements Validator<string> {
    readonly regex: RegExp = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
    check(value: string): boolean {
        return this.regex.test(value)
    }
}

// PASSWORD
export interface PasswordStrength {
    readonly name: string,
    readonly minimumLength: number
    readonly minimumLowerCase?: number
    readonly minimumUpperCase?: number
    readonly minimumDigit?: number
    readonly minimumSpecialChar?: number
}

namespace RegExpFactory {
    function toRegex(pattern: string): RegExp {
        return new RegExp(pattern)
    }

    export function atLeastLength(min: number = 1): RegExp {
        return toRegex("(?:.*[^\\s].*){"+min +",}")
    }

    export function atLeastLowerCase(number: number = 1): RegExp {
        return toRegex("(?:.*[a-z].*){" + number + ",}")
    }

    export function atLeastUpperCase(number: number = 1): RegExp {
        return toRegex("(?:.*[A-Z].*){" + number + ",}")
    }

    export function atLeastDigit(number: number = 1): RegExp {
        return toRegex("(?:.*[0-9].*){" + number + ",}")
    }

    export function atLeastSpecialChar(number: number = 1): RegExp {
        return toRegex("(?:.*[^A-Za-z0-9\\s].*){" + number + ",}")
    }
}

export namespace PasswordStrength {

    export type CheckAlways = boolean
    export type CheckEventually = boolean | void

    export interface Checker {
        length(value: string): CheckAlways
        lowercase(value: string): CheckEventually
        uppercase(value: string): CheckEventually
        digit(value: string): CheckEventually
        specialChars(value: string): CheckEventually

        every(value: string): boolean
        some(value: string): boolean
    }

    export namespace Checker {
        export namespace Operation {
            const AND: boolean = true // NEUTRAL VALUE OF LOGIC 'AND'
            const OR: boolean = false // NEUTRAL VALUE OF LOGIC 'OR'

            type CheckerTypes = CheckEventually | CheckAlways

            export function and(...args: CheckerTypes[]): boolean{
                return args.map(r => toCheckAlways(r, AND)).every(r => r)
            }

            export function or(...args: CheckerTypes[]): boolean{
                return args.map(r => toCheckAlways(r, OR)).some(r => r)
            }

            function toCheckAlways(checkEventually: CheckEventually, logicOperation: boolean): CheckAlways {
                return typeof checkEventually === "boolean" ? checkEventually : (!!logicOperation)
            }
        }
    }

    export abstract class ExtendedConstructor implements PasswordStrength, Checker {
        abstract name: string;
        abstract minimumLength: number;
        minimumLowerCase?: number;
        minimumUpperCase?: number;
        minimumDigit?: number;
        minimumSpecialChar?: number;

        length(value: string): CheckAlways {
            return RegExpFactory.atLeastLength(this.minimumLength).test(value)
        }
        lowercase(value: string): CheckEventually {
            if(!this.minimumLowerCase) return
            return RegExpFactory.atLeastLowerCase(this.minimumLowerCase).test(value)
        }
        uppercase(value: string): CheckEventually {
            if(!this.minimumUpperCase) return
            return RegExpFactory.atLeastUpperCase(this.minimumUpperCase).test(value)
        }
        digit(value: string): CheckEventually {
            if(!this.minimumDigit) return
            return RegExpFactory.atLeastDigit(this.minimumDigit).test(value)
        }
        specialChars(value: string): CheckEventually {
            if(!this.minimumSpecialChar) return
            return RegExpFactory.atLeastSpecialChar(this.minimumSpecialChar).test(value)
        }
        every(value: string): boolean {
            return Checker.Operation.and(
                this.length(value),
                this.lowercase(value),
                this.uppercase(value),
                this.digit(value),
                this.specialChars(value)
            );
        }
        some(value: string): boolean {
            return Checker.Operation.or(
                this.length(value),
                this.lowercase(value),
                this.uppercase(value),
                this.digit(value),
                this.specialChars(value)
            );
        }
    }

    export type Extended = PasswordStrength & Checker
}

export interface PasswordValidator {
    readonly passwordStrengths: PasswordStrength.Extended[]
    check(password: string, strength: PasswordStrength): boolean
    strength(password: string): PasswordStrength
}

export type PasswordStrengthDefault = {
    readonly WEAK: PasswordStrength.Extended,
    readonly GOOD: PasswordStrength.Extended,
    readonly MEDIUM: PasswordStrength.Extended,
    readonly STRONG: PasswordStrength.Extended
}

export type PasswordValidatorExtended = PasswordValidator & PasswordStrengthDefault

export const PasswordValidator: PasswordValidatorExtended = new class implements PasswordValidator {

    private readonly _passwordStrengths: PasswordStrength.Extended[] = []

    public readonly WEAK: PasswordStrength.Extended = new class extends PasswordStrength.ExtendedConstructor {
        name = "weak"
        minimumLength = 1
    }

    public readonly GOOD: PasswordStrength.Extended = new class extends PasswordStrength.ExtendedConstructor {
        name = "good"
        minimumLength = 8
        minimumLowerCase = 1
        minimumUpperCase = 1
        minimumDigit = 1
        minimumSpecialChar = 1
    }

    public readonly MEDIUM: PasswordStrength.Extended = new class extends PasswordStrength.ExtendedConstructor {
        name = "medium"
        minimumLength = 12
        minimumLowerCase = 1
        minimumUpperCase = 1
        minimumDigit = 2
        minimumSpecialChar = 1
    }

    public readonly STRONG: PasswordStrength.Extended = new class extends PasswordStrength.ExtendedConstructor {
        name = "strong"
        minimumLength = 15
        minimumLowerCase = 1
        minimumUpperCase = 1
        minimumDigit = 2
        minimumSpecialChar = 2
    }

    constructor() {
        this._passwordStrengths = [
            this.WEAK, this.GOOD, this.MEDIUM, this.STRONG,
        ]
    }

    get passwordStrengths(): PasswordStrength.Extended[] {
        return this._passwordStrengths
    }

    check(password: string, strength: PasswordStrength): boolean | never {
        let checker: PasswordStrength.Checker = this._passwordStrengths.find(p => p === strength)
        if(!checker) throw new Error("PasswordStrength['" + strength.name + "'] is not in PasswordValidator ");
        return checker.every(password)
    }

    strength(password: string): PasswordStrength {
        if(!password || password.trim().length === 0) return
        if(this.check(password, this.STRONG)) return this.STRONG
        if(this.check(password, this.MEDIUM)) return this.MEDIUM
        if(this.check(password, this.GOOD)) return this.GOOD
        return this.WEAK
    }
}
