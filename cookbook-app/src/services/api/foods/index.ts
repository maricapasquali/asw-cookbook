import * as methods from "../methods";
import {AxiosResponse} from "axios";

export function createFood(food: object, token: string): Promise<AxiosResponse>  {
    return methods.post('/foods', food, {
        headers: {
            authorization: 'Bearer ' + token
        },
    })
}

export function getFoods(token: string, paginationOptions?: {page: number, limit: number}): Promise<AxiosResponse>  {
    return methods.get('/foods', {
        headers: {
            authorization: 'Bearer ' + token
        },
        params: paginationOptions,
    })
}

export function getFood(foodID: string, token: string): Promise<AxiosResponse>  {
    return methods.get('/foods/:id', {
        headers: {
            authorization: 'Bearer ' + token
        },
        urlParams:{
            id: foodID
        }
    })
}

export function updateFood(foodID: string, data: object, token: string): Promise<AxiosResponse> {
    return methods.patch('/foods/:id',  data,{
        headers: {
            authorization: 'Bearer ' + token
        },
        urlParams:{
            id: foodID
        }
    })
}