import * as methods from "../methods";
import  {AxiosResponse} from "axios";

import * as handlerErrors from "./handlerErrors"
import {Server} from "../index";
import {getHeaderBearerAuthorization} from "../utils";


function setImageUrl(user: any){
    if(user.information.img){
        user.information.img = Server.images.path(user.information.img)
        console.log('image = ' + user.information.img)
    }
}

export const HandlerErrors = handlerErrors

export function login(credential: {userID: string, password: string}): Promise<AxiosResponse> {
    return methods.post('/users/login',{},{
        headers: {
            authorization: 'Basic ' +
                Buffer.from(credential.userID+':'+credential.password, 'utf-8')
                    .toString('base64')
        }
    })
}

export function sendEmailResetPassword(email: string): Promise<AxiosResponse> {
    return methods.get('/reset-password/email', {
        params: { // QUERY
            email: email
        }
    })
}

export function signup(user: object): Promise<AxiosResponse> {
    return methods.post('/users', user, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
}

export function checkAccount(data: object): Promise<AxiosResponse> {
    return methods.put('/users/check-account', data)
}

export function getUser(id: string, token?: string){
    return methods.get('/users/:id', {
        headers: getHeaderBearerAuthorization(token),
        urlParams:{
            id: id
        }
    }).then(response =>{
        setImageUrl(response.data)
        return response
    })
}

//use token (interceptors)
export function isAuthorized(id: string, token: string) {
    return methods.get('/users/:id/authorized', {
        headers: {
            authorization: 'Bearer ' + token
        },
        urlParams:{
            id: id
        }
    })
}

//use token  (interceptors)
export function updateUserInfo(id: string, info: object,  token: string){
    return methods.patch('/users/:id', info, {
        headers: {
            authorization: 'Bearer ' + token,
            'Content-Type': 'multipart/form-data'
        },
        urlParams:{
            id: id
        }
    }).then(response =>{
        if(response.data.info.img){
            response.data.info.img =  Server.images.path(response.data.info.img)
            console.log('image = ' + response.data.info.img)
        }
        return response
    })
}

//use token  (interceptors)
export function deleteAccount(id: string, token: string){
    return methods.erase('/users/:id', {
        headers: {
            authorization: 'Bearer ' + token,
        },
        urlParams:{
            id: id
        }
    })
}

//use token  (interceptors)
function changeCredential(type: {name: "userID" | "password"}, id: string, data: object, token: string, reset: boolean = false){
    return methods.patch('/users/:id/credentials', data, {
        headers: {
            authorization: 'Bearer ' + token,
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

export function changeUserID(id: string, data: object, token: string){
    return changeCredential({name: "userID"}, id, data, token)
}

export function changeOldPassword(id: string, data: object, token: string, reset: boolean = false){
    return changeCredential({name: "password"}, id, data, token, reset)
}


//use token  (interceptors)
export function logout(id: string, token: string){
    return methods.erase('/users/:id/logout', {
        headers: {
            authorization: 'Bearer ' + token,
        },
        urlParams:{
            id: id
        }
    })
}

export function checkLinkResetPassword(key: string){
    return methods.get('/reset-password/check-link', {
        params: { // QUERY
            key: key
        }
    })
}

export function getUserFromNickname(nickname: string){
    return methods.get('/reset-password/users',{
        params: { // QUERY
            nickname: nickname
        }
    })
}

export type UserSearch = { search: 'full' | 'partial', value: string }
export type UserQueryOptions = { userID?: UserSearch, fullname?: UserSearch }
export function getUsers(query?: UserQueryOptions, token?: string, paginationOptions?: {page: number, limit: number}): Promise<AxiosResponse>{
    return methods.get('/users', {
        headers: getHeaderBearerAuthorization(token),
        params: {...query, ...paginationOptions}
    })
    .then(response => {
        response.data.items.forEach(user => setImageUrl(user))
        return response
    })
}