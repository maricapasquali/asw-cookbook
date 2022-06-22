import { AxiosResponse } from "axios"

import _session from "./session"
import { getHeaderBearerAuthorization } from "../utils"
import {
    OptionsRequestType,
    PaginationOptions,
    UserQueryOptions
} from "../request-options"
import { MethodsAxios } from "../methods"

export default function (methods: MethodsAxios) {

    function setImageUrl(user: any) {
        if (user.information.img) {
            user.information.img = methods.info.images.path(user.information.img)
            console.debug("image = " + user.information.img)
        }
    }

    const session = _session(methods)

    function signup(user: object): Promise<AxiosResponse> {
        return methods.post("/users", user, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        })
    }

    function sendEmailResetPassword(email: string): Promise<AxiosResponse> {
        return methods.get("/reset-password/email", {
            params: { // QUERY
                email: email
            }
        })
    }

    function checkAccount(data: object): Promise<AxiosResponse> {
        return methods.put("/users", data)
    }

    function getUser(id: string, token?: string, options?: OptionsRequestType): Promise<AxiosResponse> {
        return methods.get("/users/:id", {
            headers: getHeaderBearerAuthorization(token),
            cancelToken: options?.cancelToken,
            urlParams:{
                id: id
            }
        }).then(response => {
            setImageUrl(response.data)
            return response
        })
    }

    //use token  (interceptors)
    function updateUserInfo(id: string, info: object,  token: string): Promise<AxiosResponse> {
        return methods.patch("/users/:id", info, {
            headers: {
                authorization: "Bearer " + token,
                "Content-Type": "multipart/form-data"
            },
            urlParams:{
                id: id
            }
        }).then(response => {
            if (response.data.info.img) {
                response.data.info.img =  methods.info.images.path(response.data.info.img)
                console.debug("image = " + response.data.info.img)
            }
            return response
        })
    }

    //use token  (interceptors)
    function deleteAccount(id: string, token: string): Promise<AxiosResponse> {
        return methods.erase("/users/:id", {
            headers: {
                authorization: "Bearer " + token,
            },
            urlParams:{
                id: id
            }
        })
    }

    //use token  (interceptors)
    function changeCredential(type: {name: "userID" | "password"}, id: string, data: object, token: string, reset = false): Promise<AxiosResponse> {
        return methods.patch("/users/:id/credentials", data, {
            headers: {
                authorization: "Bearer " + token,
            },
            params: { // QUERY
                change: type.name,
                reset: reset
            },
            urlParams:{
                id: id
            }
        })
    }

    function changeUserID(id: string, data: object, token: string): Promise<AxiosResponse> {
        return changeCredential({ name: "userID" }, id, data, token)
    }

    function changeOldPassword(id: string, data: object, token: string, reset = false): Promise<AxiosResponse> {
        return changeCredential({ name: "password" }, id, data, token, reset)
    }

    function checkLinkResetPassword(key: string): Promise<AxiosResponse> {
        return methods.get("/reset-password/check-link", {
            params: { // QUERY
                key: key
            }
        })
    }

    function getUserFromNickname(nickname: string, key: string): Promise<AxiosResponse> {
        return methods.get("/reset-password/users",{
            params: { // QUERY
                nickname,
                key
            }
        })
    }

    function getUsers(query?: UserQueryOptions, token?: string, paginationOptions?: PaginationOptions, options?: OptionsRequestType): Promise<AxiosResponse> {
        return methods.get("/users", {
            cancelToken: options?.cancelToken,
            headers: getHeaderBearerAuthorization(token),
            params: { ...query, ...paginationOptions }
        })
            .then(response => {
                response.data.items.forEach(user => setImageUrl(user))
                return response
            })
    }

    return {
        session,

        signup,
        sendEmailResetPassword,
        checkAccount,
        getUser,
        updateUserInfo,
        deleteAccount,
        changeUserID,
        changeOldPassword,
        checkLinkResetPassword,
        getUserFromNickname,
        getUsers
    }
}
