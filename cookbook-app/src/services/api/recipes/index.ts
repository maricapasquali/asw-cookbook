import {AxiosResponse} from "axios";

import _likes from './likes'
import _comments from './comments'

import {getHeaderBearerAuthorization} from "../utils";
import {OptionsRequestType, PaginationOptions, RecipeFilters} from "../request-options";
import {MethodsAxios} from "../methods";


export default function (methods: MethodsAxios) {
    const likes = _likes(methods)
    const comments = _comments(methods)


    function setUrlPath(recipe: any){
        if(recipe.img) {
            recipe.img = methods.info.images.path(recipe.img)
            console.debug('image = ' + recipe.img)
        }
        if(recipe.tutorial) {
            recipe.tutorial = methods.info.videos.path(recipe.tutorial)
            console.debug('tutorial = ' + recipe.tutorial)
        }
    }

    function allSharedRecipes(token?: string, optionsPagination?: PaginationOptions, filters?: RecipeFilters, options?: OptionsRequestType): Promise<AxiosResponse>  {
        return methods.get('/recipes', {
            headers: getHeaderBearerAuthorization(token),
            cancelToken: options?.cancelToken,
            params: {...optionsPagination, ...filters}
        })
            .then(response => {
                response.data.items.forEach(recipe => setUrlPath(recipe))
                return response
            })
    }

    function numberRecipesForCountry(token?: string, options?: OptionsRequestType): Promise<AxiosResponse>  {
        return methods.get('/recipes-for-country', {
            cancelToken: options?.cancelToken,
            headers: getHeaderBearerAuthorization(token),
        })
    }

    function createRecipe(user: string, data: any, token: string): Promise<AxiosResponse>{
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

    function getRecipes(user: string, token?: string, type?: string, paginationOptions?: PaginationOptions, filters?: RecipeFilters, options?: OptionsRequestType): Promise<AxiosResponse>  {
        return methods.get('/users/:userID/recipes', {
            headers: getHeaderBearerAuthorization(token),
            cancelToken: options?.cancelToken,
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

    function getRecipe(user: string, id: string, type: string, token?: string, options?: OptionsRequestType): Promise<AxiosResponse>  {
        const pathName = user ? '/users/:userID/recipes/:recipeID' : '/recipes/:recipeID'
        return methods.get(pathName, {
            cancelToken: options?.cancelToken,
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

    function updateRecipe(user: string, id: string, data: object, token: string): Promise<AxiosResponse>{
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

    function deleteRecipe(user: string, id: string, token: string){
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

    function updatePermission(user: string, recipeID: string, permission: Array<{ user: string, granted?: string }>, token: string): Promise<AxiosResponse>{
        return methods.patch('/users/:userID/recipes/:recipeID', {permission}, {
            headers: {
                authorization: 'Bearer ' + token
            },
            params: {
                field: 'permission'
            },
            urlParams:{
                userID: user,
                recipeID
            }
        })
            .then(response => {
                setUrlPath(response.data?.updatedRecipe)
                return response
            })
    }



    return {
        likes,
        comments,
        allSharedRecipes,
        numberRecipesForCountry,
        createRecipe,
        getRecipes,
        getRecipe,
        updateRecipe,
        deleteRecipe,
        updatePermission
    }
}