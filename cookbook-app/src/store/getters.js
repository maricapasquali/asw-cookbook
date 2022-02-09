export default {
    genders: state => state._genders,

    countries: state => state._countries,

    diets: state => state._diets,

    recipeCategories: state => state._recipeCategories,

    concreteDiets: state => state._diets.filter(d => d.value !== ''),

    getCountryByValue: (state) => (value) => {
        return state._countries.find(country => country.value === value)
    },

    getDietByValue: (state) => (value) => {
        return state._diets.find(diet => diet.value === value)
    },

    getGenderByValue: (state) => (value) => {
        return state._genders.find(gender => gender.value === value)
    },

    getRecipeCategoryByValue: (state) => (value) => {
        return state._recipeCategories.find(rCategory => rCategory.value === value)
    }
}