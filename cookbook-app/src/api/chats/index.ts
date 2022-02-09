import * as methods from "../methods";
import {AxiosResponse} from "axios";

import * as _messages from './messages'
import {client_origin} from "../../../../modules/hosting/variables";

export const messages = _messages

function setUrlAttachment(message: any): string {
    if(message.attachment) message.attachment = `${client_origin}${message.attachment}`
    return message
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

export function getChats(user: string, token: string, query?: { 'unread-messages': boolean}): Promise<AxiosResponse> {
    return methods.get('/users/:id/chats', {
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
        response.data.items.forEach(chat => chat.messages.forEach(message => setUrlAttachment(message)))
        return response
    })
}

export function getChat(user: string, chatID: string, token: string): Promise<AxiosResponse> {
    return methods.get('/users/:id/chats/:chatID', {
        headers: {
            authorization: 'Bearer ' + token
        },
        urlParams:{
            id: user,
            chatID
        }
    }).then(response =>{
        response.data.messages.forEach(message => setUrlAttachment(message))
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