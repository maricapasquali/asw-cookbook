"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Vegetarian = exports.Vegan = exports.LactoseFree = exports.GlutenFree = exports.Light = exports.None = void 0;
class Diet {
    constructor(value, text) {
        this.value = value;
        this.text = text;
    }
}
exports.None = new Diet('', "-- None --");
exports.Light = new Diet("light", "Light");
exports.GlutenFree = new Diet("gluten free", "Senza glutine");
exports.LactoseFree = new Diet("lactose free", "Senza lattosio");
exports.Vegan = new Diet("vegan", "Vegano");
exports.Vegetarian = new Diet("vegetarian", "Vegetariano");
exports.default = [
    exports.None,
    exports.Light,
    exports.GlutenFree,
    exports.LactoseFree,
    exports.Vegan,
    exports.Vegetarian
];
//# sourceMappingURL=diets.js.map