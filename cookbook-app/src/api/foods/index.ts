import * as methods from "../methods";
import {AxiosResponse} from "axios";
import {getHeaderBearerAuthorization} from "../utils";
import {FoodsQueryOptions, OptionsRequestType, PaginationOptions} from "../request-options";


export function createFood(food: object, token: string): Promise<AxiosResponse>  {
    return methods.post('/foods', food, {
        headers: {
            authorization: 'Bearer ' + token
        },
    })
}

export function getFoods(token?: string, query?: FoodsQueryOptions, paginationOptions?: PaginationOptions, options?: OptionsRequestType): Promise<AxiosResponse>  {
    return methods.get('/foods', {
        cancelToken: options?.cancelToken,
        headers: getHeaderBearerAuthorization(token),
        params: {
            ...paginationOptions,
            ...query
        },
    })
}

export function getFood(foodID: string, token?: string): Promise<AxiosResponse>  {
    return methods.get('/foods/:id', {
        headers: getHeaderBearerAuthorization(token),
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
