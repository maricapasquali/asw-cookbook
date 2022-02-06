import {AxiosResponse} from "axios";
import * as methods from "../../methods";

export function getReportedComment(token: string): Promise<AxiosResponse>  {
    return methods.get('/comments-reported', {
        headers: {
            authorization: 'Bearer ' + token
        }
    })
}

export function createComment(user: string, recipe: string, data: object, token?: string): Promise<AxiosResponse>  {
    let headers = { authorization: 'Bearer ' + token }
    if(!token) delete headers.authorization

    return methods.post('/users/:userID/recipes/:recipeID/comments', data, {
        headers: headers,
        urlParams:{
            userID: user,
            recipeID: recipe,
        }
    })
}

export function updateComment(user: string, recipe: string, comment: string, token: string, options: {data?: {content: string}, action?: string}): Promise<AxiosResponse>  {
    let headers = { authorization: 'Bearer ' + token,  'content-type': 'application/json' }
    if(!token) delete headers.authorization
    return methods.patch('/users/:userID/recipes/:recipeID/comments/:commentID', options.data || {}, {
        headers: headers,
        params: {
          action: options.action
        },
        urlParams:{
            userID: user,
            recipeID: recipe,
            commentID: comment,
        }
    })
}

export function deleteComment(user: string, recipe: string, comment: string, token: string): Promise<AxiosResponse>  {
    return methods.erase('/users/:userID/recipes/:recipeID/comments/:commentID', {
        headers: {
            authorization: 'Bearer ' + token
        },
        urlParams:{
            userID: user,
            recipeID: recipe,
            commentID: comment,
        }
    })
}

export function createResponse(user: string, recipe: string, comment: string, data: object, token?: string): Promise<AxiosResponse>  {
    let headers = { authorization: 'Bearer ' + token }
    if(!token) delete headers.authorization
    return methods.post('/users/:userID/recipes/:recipeID/comments/:commentID/responses', data, {
        headers: headers,
        urlParams:{
            userID: user,
            recipeID: recipe,
            commentID: comment,
        }
    })
}

