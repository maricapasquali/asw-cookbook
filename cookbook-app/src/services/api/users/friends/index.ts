import { AxiosResponse } from "axios"
import { getHeaderBearerAuthorization } from "../../utils"
import {
    OptionsRequestType,
    PaginationOptions
} from "../../request-options"
import { MethodsAxios } from "../../methods"

export default function (methods: MethodsAxios){

    function getFriendOf(user: string, token?: string, queryOptions?: object, paginationOptions?: PaginationOptions, options?: OptionsRequestType): Promise<AxiosResponse> {
        return methods.get("/users/:id/friends", {
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

    function requestFriendShip(user: string, token: string): Promise<AxiosResponse> {
        return methods.post("/users/:id/friends", {}, {
            headers: {
                authorization: "Bearer " + token
            },
            urlParams: {
                id: user
            }
        })
    }

    function updateFriendShip(user: string, friendID: string, data: { state: "accepted" | "rejected" }, token: string): Promise<AxiosResponse> {
        return methods.patch("/users/:id/friends/:friendID", data, {
            headers: {
                authorization: "Bearer " + token
            },
            urlParams: {
                id: user,
                friendID: friendID
            }
        })
    }

    function breakFriendShip(user: string, friendID: string, token: string): Promise<AxiosResponse> {
        return methods.erase("/users/:id/friends/:friendID", {
            headers: {
                authorization: "Bearer " + token
            },
            urlParams: {
                id: user,
                friendID: friendID
            }
        })
    }

    return {
        getFriendOf,
        requestFriendShip,
        updateFriendShip,
        breakFriendShip
    }
}
