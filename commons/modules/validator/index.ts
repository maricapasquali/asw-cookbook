interface Validator<T> {
    regex: RegExp
    check(value: T): boolean
}

abstract class StringValidator implements Validator<string>{
    regex: RegExp
    check(value: string): boolean {
        return this.regex.test(value);
    }
}

class CEmailValidator extends StringValidator {
    regex: RegExp = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
}

class CPasswordValidator extends StringValidator {
    /**
     * At least 8 characters,
     * min 1 Uppercase
     * min 1 Lowercase
     * min 1 Number
     * min 1 special character
     * only contains symbols from the alphabet, numbers and chosen special characters
     */
    regex: RegExp = /(?=[A-Za-z0-9@#$%^&+!=]+$)^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[@#$%^&+!=])(?=.{8,}).*$/;
}

export const EmailValidator: StringValidator = new CEmailValidator();
export const PasswordValidator: StringValidator = new CPasswordValidator();

export default {
    EmailValidator,
    PasswordValidator
}