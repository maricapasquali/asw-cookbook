import * as methods from "../methods";
import  {AxiosResponse} from "axios";

import * as handlerErrors from "./handlerErrors"
import * as variables from "../../../../../modules/hosting/variables"

const serverImage = process.env.VUE_APP_IMAGES_ORIGIN || variables.images_origin

export const HandlerErrors = handlerErrors

export function login(credential: {userID: string, password: string}): Promise<AxiosResponse> {
    return methods.post('/users/login',null,{
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
    let headers = {}
    if(token) headers['authorization'] = 'Bearer ' + token

    return methods.get('/users/:id', {
        headers: headers,
        urlParams:{
            id: id
        }
    }).then(response =>{
        if(response.data.information.img){
            response.data.information.img = `${serverImage}/${response.data.information.img}`
            console.log('image = ' + response.data.information.img)
        }
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
            response.data.info.img = `${serverImage}/${response.data.info.img}`
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