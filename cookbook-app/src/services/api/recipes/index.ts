import * as methods from "../methods";
import {AxiosResponse} from "axios";

import * as _likes from './likes'
import * as _comments from './comments'
import {Server} from "../index";
import {getHeaderBearerAuthorization} from "../utils";

function setUrlPath(recipe: any){
    if(recipe.img) {
        recipe.img = Server.images.path(recipe.img)
        console.log('image = ' + recipe.img)
    }
    if(recipe.tutorial) {
        recipe.tutorial = Server.videos.path(recipe.tutorial)
        console.log('tutorial = ' + recipe.tutorial)
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
        response.data.items.forEach(recipe => setUrlPath(recipe))
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
        setUrlPath(response.data)
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
        response.data.items.forEach(recipe => setUrlPath(recipe))
        return response
    })
}

export function getRecipe(user: string, id: string, type: string, token?: string): Promise<AxiosResponse>  {
    const pathName = user ? '/users/:userID/recipes/:recipeID' : '/recipes/:recipeID'
    return methods.get(pathName, {
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
        setUrlPath(response.data)
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
        setUrlPath(response.data)
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