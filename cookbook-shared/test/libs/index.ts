import  {assert, expect} from 'chai'

import  {
    EmailValidator,
    PasswordValidator
} from '../../libs/validator'

describe('Validator', function (){
    describe('Email', function() {
        it('should return false when the value is not valid', function() {
            expect(EmailValidator.check('mario@')).false
        });

        it('should return true when the value is valid', function() {
            expect(EmailValidator.check('mario@gmail.com')).true
        });
    });

    describe("Password", function (){

        const {WEAK, GOOD, MEDIUM, STRONG} = PasswordValidator

        let weakPassword = "pass"
        let weak1Password = "password"
        let weak2Password = "password122"

        let goodPassword = "Passwo#1"
        let good1Password = "MaRWat>1"

        let mediumPassword = "Ciao$111%-ciao"
        let medium1Password = "!Kia-ciao$1ci2"

        let strongPassword = "#Ciao$123-ciao---"
        let strong1Password = "##########Ciao$11"
        let strong2Password = "<2Super-Mario!!#Bos#1>"

        it(`A empty string should not have strength`, function (){
            expect(PasswordValidator.strength("")).undefined
        })

        it(`A string with only space should not have strength`, function (){
            expect(PasswordValidator.strength("             ")).undefined
        })

        it(`'${weakPassword}' should have weak strength`, function (){
            assert.equal(PasswordValidator.strength(weakPassword), WEAK)
        })

        it(`'${weak1Password}' should have weak strength`, function (){
            assert.equal(PasswordValidator.strength(weak1Password), WEAK)
        })

        it(`'${weak2Password}' should have weak strength`, function (){
            assert.equal(PasswordValidator.strength(weak2Password), WEAK)
        })

        it(`'${goodPassword}' should have good strength`, function (){
            assert.equal(PasswordValidator.strength(goodPassword), GOOD)
        })

        it(`'${good1Password}' should have good strength`, function (){
            assert.equal(PasswordValidator.strength(good1Password), GOOD)
        })

        it(`'${mediumPassword}' should have medium strength`, function (){
            assert.equal(PasswordValidator.strength(mediumPassword), MEDIUM)
        })

        it(`'${medium1Password}' should have medium strength`, function (){
            assert.equal(PasswordValidator.strength(medium1Password), MEDIUM)
        })

        it(`'${strongPassword}' should have strong strength`, function (){
            assert.equal(PasswordValidator.strength(strongPassword), STRONG)
        })

        it(`'${strong1Password}' should have strong strength`, function (){
            assert.equal(PasswordValidator.strength(strong1Password), STRONG)
        })

        it(`'${strong2Password}' should have strong strength`, function (){
            assert.equal(PasswordValidator.strength(strong2Password), STRONG)
        })
    })
})
