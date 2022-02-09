import {AxiosResponse} from "axios";
import methods from "../methods";


export function createShoppingListPoint(user: string, data: object, token: string): Promise<AxiosResponse>  {
    return methods.post('/users/:userID/shopping-list', data,{
        headers: {
            authorization: 'Bearer ' + token
        },
        urlParams:{
            userID: user
        }
    })
}

export function getShoppingList(user: string, token: string): Promise<AxiosResponse>  {
    return methods.get('/users/:userID/shopping-list', {
        headers: {
            authorization: 'Bearer ' + token
        },
        urlParams:{
            userID: user
        }
    })
}

export function updateShoppingListPoint(user: string, point: string, data: object, token: string): Promise<AxiosResponse>  {
    return methods.patch('/users/:userID/shopping-list/:pointID', data,{
        headers: {
            authorization: 'Bearer ' + token
        },
        urlParams:{
            userID: user,
            pointID: point
        }
    })
}

export function deleteShoppingListPoint(user: string, point: string, token: string): Promise<AxiosResponse>  {
    return methods.delete('/users/:userID/shopping-list/:pointID', {
        headers: {
            authorization: 'Bearer ' + token
        },
        urlParams:{
            userID: user,
            pointID: point
        }
    })
}