import * as methods from "../methods";
import {AxiosResponse} from "axios";

import * as _likes from './likes'
import * as _comments from './comments'
import {Server} from "../index";
import {getHeaderBearerAuthorization} from "../utils";

function setImageUrl(recipe: any){
    if(recipe.img) {
        recipe.img = Server.images.path(recipe.img)
        console.log('image = ' + recipe.img)
    }
}

export const likes = _likes
export const comments = _comments

type RecipeFilters = {name?: string, countries?: string[], diets?: string[], categories?: string[], ingredients?: string[]}
export function allSharedRecipes(token?: string, optionsPagination?: {page: number, limit: number}, filters?: RecipeFilters): Promise<AxiosResponse>  {
    return methods.get('/recipes', {
        headers: getHeaderBearerAuthorization(token),
        params: {...optionsPagination, ...filters}
    })
    .then(response => {
        response.data.items.forEach(recipe => setImageUrl(recipe))
        return response
    })
}

export function numberRecipesForCountry(token?: string): Promise<AxiosResponse>  {
    return methods.get('/recipes-for-country', {
        headers: getHeaderBearerAuthorization(token),
    })
}

export function createRecipe(user: string, data: any, token: string): Promise<AxiosResponse>{
    return methods.post('/users/:userID/recipes', data, {
        headers: {
            authorization: 'Bearer ' + token,
            'Content-Type': 'multipart/form-data'
        },
        urlParams:{
            userID: user
        }
    })
    .then(response => {
        setImageUrl(response.data)
        return response
    })
}

export function getRecipes(user: string, token?: string, type?: string, paginationOptions?: {page: number, limit: number}, filters?: RecipeFilters): Promise<AxiosResponse>  {
    return methods.get('/users/:userID/recipes', {
        headers: getHeaderBearerAuthorization(token),
        params: {
            ...paginationOptions,
            type: type,
            ...filters,
        },
        urlParams:{
            userID: user
        }
    })
    .then(response => {
        response.data.items.forEach(recipe => setImageUrl(recipe))
        return response
    })
}

export function getRecipe(user: string, id: string, type: string, token?: string): Promise<AxiosResponse>  {
    return methods.get('/users/:userID/recipes/:recipeID', {
        headers: getHeaderBearerAuthorization(token),
        params:{
          type: type
        },
        urlParams:{
            userID: user,
            recipeID: id,
        }
    })
    .then(response => {
        setImageUrl(response.data)
        return response
    })
}

export function updateRecipe(user: string, id: string, data: object, token: string): Promise<AxiosResponse>{
    return methods.patch('/users/:userID/recipes/:recipeID', data, {
        headers: {
            authorization: 'Bearer ' + token,
            'Content-Type': 'multipart/form-data'
        },
        urlParams:{
            userID: user,
            recipeID: id
        }
    })
    .then(response => {
        setImageUrl(response.data)
        return response
    })
}

export function deleteRecipe(user: string, id: string, token: string){
    return methods.erase('/users/:userID/recipes/:recipeID', {
        headers: {
            authorization: 'Bearer ' + token
        },
        urlParams:{
            userID: user,
            recipeID: id,
        }
    })
}