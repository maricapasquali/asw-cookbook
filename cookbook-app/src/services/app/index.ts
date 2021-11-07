import * as countries from './assets/countries.js'
import * as genders from './assets/genders.js'
import * as diets from './assets/diets.js'
import * as rCategories from './assets/recipe-categories.js'

type Country = {value: string, text: string, src: string}
type Gender = {value: string, text: string, src: string}
type Diet = {value: string, text: string}
type RCategory = {value: string, text: string}

function getCountries(): Array<Country> {
    return countries
}

function findCountry(value): Country {
    return countries.find(country => country.value === value)
}

function getGenders(): Array<Gender> {
    return genders
}

function findGender(value): Gender {
    return genders.find(gender => gender.value === value)
}

function getDiets(): Array<Diet> {
    return diets
}

function findDiet(value): Diet {
    return diets.find(diet => diet.value === value)
}

function getRecipeCategories(): Array<RCategory> {
    return rCategories
}

function findRecipeCategory(value): RCategory {
    return rCategories.find(rCategory => rCategory.value === value)
}

export const Countries = {
    get: getCountries,
    find: findCountry
}
export const Genders = {
    get: getGenders,
    find: findGender
}
export const Diets = {
    get:getDiets,
    find: findDiet
}
export const RecipeCategories = {
    get: getRecipeCategories,
    find: findRecipeCategory
}