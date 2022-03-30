"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Other = exports.Male = exports.Female = void 0;
class Gender {
    constructor(value, text, src) {
        this.value = value;
        this.text = text;
        this.src = src;
    }
}
exports.Female = new Gender("female", "Femmina", require('@assets/icons/genders/female.png'));
exports.Male = new Gender("male", "Maschio", require('@assets/icons/genders/male.png'));
exports.Other = new Gender("other", "Altro", require('@assets/icons/genders/other.png'));
exports.default = [
    exports.Female,
    exports.Male,
    exports.Other
];
//# sourceMappingURL=genders.js.map