import getters from "./getters";

import assetsUtils from '@utils/assets'

export default {
    state: {
        _genders: assetsUtils.Genders,
        _countries: assetsUtils.Countries,
        _diets: assetsUtils.Diets,
        _recipeCategories: assetsUtils.RecipeCategories,
    },
    getters
}