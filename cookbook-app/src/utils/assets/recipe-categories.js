"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SideDish = exports.Drink = exports.Desserts = exports.SecondCourses = exports.FirstCourses = exports.Appetizers = void 0;
class RecipeCategory {
    constructor(value, text) {
        this.value = value;
        this.text = text;
    }
}
exports.Appetizers = new RecipeCategory("appetizers", "Anti pasto");
exports.FirstCourses = new RecipeCategory("first courses", "Primo piatto");
exports.SecondCourses = new RecipeCategory("second courses", "Secondo piatto");
exports.Desserts = new RecipeCategory("desserts", "Dolci");
exports.Drink = new RecipeCategory("drink", "Drink");
exports.SideDish = new RecipeCategory("side dish", "Contorno");
exports.default = [
    exports.Appetizers,
    exports.FirstCourses,
    exports.SecondCourses,
    exports.Desserts,
    exports.Drink,
    exports.SideDish
];
//# sourceMappingURL=recipe-categories.js.map