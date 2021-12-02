import * as methods from "../methods";
import {AxiosResponse} from "axios";

import * as _likes from './likes'
import * as _comments from './comments'
import * as variables from "../../../../../modules/hosting/variables";

const serverImage = process.env.VUE_APP_IMAGES_ORIGIN || variables.images_origin

function setImageUrl(recipe: any){
    if(recipe.img){
        recipe.img = `${serverImage}/${recipe.img}`
        console.log('image = ' + recipe.img)
    }
}

export const likes = _likes
export const comments = _comments

export function allSharedRecipes(optionsPagination?: {page: number, limit: number}): Promise<AxiosResponse>  {
    return methods.get('/recipes', {
        params: optionsPagination
    })
    .then(response => {
        response.data.items.forEach(recipe => setImageUrl(recipe))
        return response
    })
}

export function recipesForCountry(): Promise<AxiosResponse>  {
    return methods.get('/recipes-for-country')
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

export function getRecipes(user: string, token?: string, type?: string, paginationOptions?: {page: number, limit: number}): Promise<AxiosResponse>  {
    let headers =  { authorization: 'Bearer ' + token }
    if(!token) delete headers.authorization
    let params = {
        type: undefined,
        page: undefined,
        limit : undefined,
    }
    if(type) params.type = type
    if(paginationOptions) {
        params.page = paginationOptions.page
        params.limit = paginationOptions.limit
    }
    return methods.get('/users/:userID/recipes', {
        headers: headers,
        params: params,
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
    let headers =  { authorization: 'Bearer ' + token }
    if(!token) delete headers.authorization
    return methods.get('/users/:userID/recipes/:recipeID', {
        headers: headers,
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