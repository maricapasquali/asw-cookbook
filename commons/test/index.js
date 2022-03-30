const assert = require('assert');

const {EmailValidator, PasswordValidator} = require('../modules/validator')

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
