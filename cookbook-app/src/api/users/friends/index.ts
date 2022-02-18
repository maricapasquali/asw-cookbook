import {AxiosResponse} from "axios";
import * as methods from "../../methods";
import {getHeaderBearerAuthorization} from "../../utils";
import {OptionsRequestType, PaginationOptions} from "../../request-options";

export function getFriendOf(user: string, token?: string, queryOptions?: {}, paginationOptions?: PaginationOptions, options?: OptionsRequestType): Promise<AxiosResponse> {
    return methods.get('/users/:id/friends', {
        headers: getHeaderBearerAuthorization(token),
        cancelToken: options?.cancelToken,
        params: {
            ...paginationOptions,
            ...queryOptions
        },
        urlParams:{
            id: user
        }
    })
}

export function requestFriendShip(user: string, token: string): Promise<AxiosResponse> {
    return methods.post('/users/:id/friends', {}, {
        headers: {
            authorization: 'Bearer ' + token
        },
        urlParams: {
            id: user
        }
    })
}

export function updateFriendShip(user: string, friendID: string, data: { state: 'accepted' | 'rejected' }, token: string): Promise<AxiosResponse> {
    return methods.patch('/users/:id/friends/:friendID', data, {
        headers: {
            authorization: 'Bearer ' + token
        },
        urlParams: {
            id: user,
            friendID: friendID
        }
    })
}

export function breakFriendShip(user: string, friendID: string, token: string): Promise<AxiosResponse> {
    return methods.erase('/users/:id/friends/:friendID', {
        headers: {
            authorization: 'Bearer ' + token
        },
        urlParams: {
            id: user,
            friendID: friendID
        }
    })
}
