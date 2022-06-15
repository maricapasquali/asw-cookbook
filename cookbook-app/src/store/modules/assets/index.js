import getters from "./getters"

import {
    Countries,
    Diets,
    Genders,
    RecipeCategories
} from "@shared/assets"

export default {
    state: {
        _genders: Genders,
        _countries: Countries,
        _diets: Diets,
        _recipeCategories: RecipeCategories,
    },
    getters
}
