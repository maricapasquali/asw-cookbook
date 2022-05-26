import getters from "./getters";

import {
    Genders,
    Countries,
    Diets,
    RecipeCategories
} from "cookbook-shared/assets"

export default {
    state: {
        _genders: Genders,
        _countries: Countries,
        _diets: Diets,
        _recipeCategories: RecipeCategories,
    },
    getters
}
