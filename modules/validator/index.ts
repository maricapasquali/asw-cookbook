export interface IValidator {
    regex: RegExp
    check(value: string): boolean
}

export const EmailValidator: IValidator = {
    regex: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
    check(value: string): boolean {
        return this.regex.test(String(value).toLowerCase());
    }
}

