import {ICountry} from './assets/countries'
import countries from './assets/countries'

import {IGender} from './assets/genders'
import genders from './assets/genders'

import {IDiet} from './assets/diets'
import diets from './assets/diets'

import {IRecipeCategory} from './assets/recipe-categories'
import rCategories from './assets/recipe-categories'


function getCountries(): Array<ICountry> {
    return countries
}

function findCountry(value): ICountry {
    return countries.find(country => country.value === value)
}

function getGenders(): Array<IGender> {
    return genders
}

function findGender(value): IGender {
    return genders.find(gender => gender.value === value)
}

function getDiets(): Array<IDiet> {
    return diets
}

function findDiet(value): IDiet {
    return diets.find(diet => diet.value === value)
}

function getRecipeCategories(): Array<IRecipeCategory> {
    return rCategories
}

function findRecipeCategory(value): IRecipeCategory {
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

export default {
    Countries,
    Genders,
    Diets,
    RecipeCategories
}