import {AxiosResponse} from "axios";
import * as methods from "../../methods";

export function like(user: string, recipe: string, token?: string, commentID?: string):Promise<AxiosResponse>  {
    let headers = { authorization: 'Bearer ' + token }
    if(!token) delete headers.authorization
    return methods.post('/users/:userID/recipes/:recipeID/likes', {}, {
        headers: headers,
        params: {
            commentID: commentID
        },
        urlParams:{
            userID: user,
            recipeID: recipe,
        }
    })
}

export function unLike(user: string, recipe: string, like: string, token?: string, commentID?: string):Promise<AxiosResponse>  {
    let headers = { authorization: 'Bearer ' + token }
    if(!token) delete headers.authorization
    return methods.erase('/users/:userID/recipes/:recipeID/likes/:likeID', {
        headers: headers,
        params: {
          commentID: commentID
        },
        urlParams:{
            userID: user,
            recipeID: recipe,
            likeID: like
        }
    })
}