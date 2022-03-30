"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Russia = exports.Brazil = exports.Portugal = exports.Canada = exports.Mexico = exports.France = exports.Germany = exports.UK = exports.Spain = exports.USA = exports.Italy = void 0;
class Country {
    constructor(value, text, src, refMap) {
        this.value = value;
        this.text = text;
        this.src = src;
        this.refMap = refMap;
    }
}
exports.Italy = new Country("IT", "Italia", require("@assets/icons/flags/italy_flag.png"), { class: 'Italy' });
exports.USA = new Country("US", "Stati Uniti d'America", require("@assets/icons/flags/united_states_flag.png"), { class: 'United States' });
exports.Spain = new Country("ES", "Spagna", require("@assets/icons/flags/spain_flag.png"), { class: 'Spain' });
exports.UK = new Country("GB", "Regno Unito", require("@assets/icons/flags/united_kingdom_flag.png"), { class: 'United Kingdom' });
exports.Germany = new Country("DE", "Germania", require("@assets/icons/flags/germany_flag.png"), { class: 'Germany' });
exports.France = new Country("FR", "Francia", require("@assets/icons/flags/france_flag.png"), { class: 'France' });
exports.Mexico = new Country("MX", "Messico", require("@assets/icons/flags/mexico_flag.png"), { class: 'Mexico' });
exports.Canada = new Country("CA", "Canada", require("@assets/icons/flags/canada_flag.png"), { class: 'Canada' });
exports.Portugal = new Country("PT", "Portogallo", require("@assets/icons/flags/portugal_flag.png"), { class: 'Portugal' });
exports.Brazil = new Country("BR", "Brasile", require("@assets/icons/flags/brazil_flag.png"), { class: 'Brazil' });
exports.Russia = new Country("RU", "Russia", require("@assets/icons/flags/russia_flag.png"), { class: 'Russian' });
exports.default = [
    exports.Italy,
    exports.USA,
    exports.Spain,
    exports.UK,
    exports.Germany,
    exports.France,
    exports.Mexico,
    exports.Canada,
    exports.Portugal,
    exports.Brazil,
    exports.Russia
].sort((c1, c2) => c1.text.localeCompare(c2.text));
//# sourceMappingURL=countries.js.map