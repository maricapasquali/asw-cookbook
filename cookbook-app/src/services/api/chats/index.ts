
import {AxiosResponse} from "axios";

import _messages from './messages'
import {ChatQueryOptions, OptionsRequestType} from "../request-options";
import {MethodsAxios} from "../methods";


export default function (methods: MethodsAxios) {

    const messages = _messages(methods)

    function createChat(user: string, data: object, token: string): Promise<AxiosResponse> {
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

    function getChats(user: string, token: string, query?: ChatQueryOptions, options?: OptionsRequestType): Promise<AxiosResponse> {
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
        })
    }

    function getChat(user: string, chatID: string, token: string, query?: ChatQueryOptions): Promise<AxiosResponse> {
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
        })
    }

    function removeChat(user: string, chatID: string, token: string): Promise<AxiosResponse> {
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

    function updateRoleInChatOne(user: string, chatID: string, data: {role: string}, token: string): Promise<AxiosResponse> {
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

    return {
        messages,

        createChat,
        getChats,
        getChat,
        removeChat,
        updateRoleInChatOne
    }
}