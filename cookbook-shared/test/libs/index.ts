import {
    assert,
    expect
} from "chai"

import {
    EmailValidator,
    PasswordValidator
} from "../../libs/validator"

describe("Validator", () => {
    describe("Email", () => {
        it("should return false when the value is not valid", () => {
            expect(EmailValidator.check("mario@")).false
        })

        it("should return true when the value is valid", () => {
            expect(EmailValidator.check("mario@gmail.com")).true
        })
    })

    describe("Password", () => {

        const { WEAK, GOOD, MEDIUM, STRONG } = PasswordValidator

        const weakPassword = "pass"
        const weak1Password = "password"
        const weak2Password = "password122"

        const goodPassword = "Passwo#1"
        const good1Password = "MaRWat>1"

        const mediumPassword = "Ciao$111%-ciao"
        const medium1Password = "!Kia-ciao$1ci2"

        const strongPassword = "#Ciao$123-ciao---"
        const strong1Password = "##########Ciao$11"
        const strong2Password = "<2Super-Mario!!#Bos#1>"

        it("A empty string should not have strength", () => {
            expect(PasswordValidator.strength("")).undefined
        })

        it("A string with only space should not have strength", () => {
            expect(PasswordValidator.strength("             ")).undefined
        })

        it(`'${weakPassword}' should have weak strength`, () => {
            assert.equal(PasswordValidator.strength(weakPassword), WEAK)
        })

        it(`'${weak1Password}' should have weak strength`, () => {
            assert.equal(PasswordValidator.strength(weak1Password), WEAK)
        })

        it(`'${weak2Password}' should have weak strength`, () => {
            assert.equal(PasswordValidator.strength(weak2Password), WEAK)
        })

        it(`'${goodPassword}' should have good strength`, () => {
            assert.equal(PasswordValidator.strength(goodPassword), GOOD)
        })

        it(`'${good1Password}' should have good strength`, () => {
            assert.equal(PasswordValidator.strength(good1Password), GOOD)
        })

        it(`'${mediumPassword}' should have medium strength`, () => {
            assert.equal(PasswordValidator.strength(mediumPassword), MEDIUM)
        })

        it(`'${medium1Password}' should have medium strength`, () => {
            assert.equal(PasswordValidator.strength(medium1Password), MEDIUM)
        })

        it(`'${strongPassword}' should have strong strength`, () => {
            assert.equal(PasswordValidator.strength(strongPassword), STRONG)
        })

        it(`'${strong1Password}' should have strong strength`, () => {
            assert.equal(PasswordValidator.strength(strong1Password), STRONG)
        })

        it(`'${strong2Password}' should have strong strength`, () => {
            assert.equal(PasswordValidator.strength(strong2Password), STRONG)
        })
    })
})
