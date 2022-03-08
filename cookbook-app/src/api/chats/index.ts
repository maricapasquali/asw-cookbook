import * as methods from "../methods";
import {AxiosResponse} from "axios";

import * as _messages from './messages'
import * as config from "../../../../env.config";
import {ChatQueryOptions, OptionsRequestType} from "../request-options";

const client_origin = config.client.origin

export const messages = _messages

function setUrlAttachment(message: any): void {
    if(message.attachment) message.attachment = `${client_origin}${message.attachment}`
}

export function createChat(user: string, data: object, token: string): Promise<AxiosResponse> {
    return methods.post('/users/:id/chats', data, {
        headers: {
            authorization: 'Bearer ' + token,
            'Content-Type': 'multipart/form-data'
        },
        urlParams:{
            id: user
        }
    })
}

export function getChats(user: string, token: string, query?: ChatQueryOptions, options?: OptionsRequestType): Promise<AxiosResponse> {
    return methods.get('/users/:id/chats', {
        cancelToken: options?.cancelToken,
        headers: {
            authorization: 'Bearer ' + token
        },
        params: {
          ...query
        },
        urlParams:{
            id: user
        }
    }).then(response =>{
        if(response.data.messages) response.data.items.forEach(chat => chat.messages.forEach(setUrlAttachment))
        return response
    })
}

export function getChat(user: string, chatID: string, token: string, query?: ChatQueryOptions): Promise<AxiosResponse> {
    return methods.get('/users/:id/chats/:chatID', {
        headers: {
            authorization: 'Bearer ' + token
        },
        params: {
            ...query
        },
        urlParams:{
            id: user,
            chatID
        }
    }).then(response =>{
        if(response.data.messages) response.data.messages.forEach(setUrlAttachment)
        return response
    })
}

export function removeChat(user: string, chatID: string, token: string): Promise<AxiosResponse> {
    return methods.erase('/users/:id/chats/:chatID', {
        headers: {
            authorization: 'Bearer ' + token
        },
        urlParams:{
            id: user,
            chatID
        }
    })
}

export function updateRoleInChatOne(user: string, chatID: string, data: {role: string}, token: string): Promise<AxiosResponse> {
    return methods.patch('/users/:id/chats/:chatID', data, {
        headers: {
            authorization: 'Bearer ' + token
        },
        params: {
          action: 'update-user-role'
        },
        urlParams:{
            id: user,
            chatID
        }
    })
}
