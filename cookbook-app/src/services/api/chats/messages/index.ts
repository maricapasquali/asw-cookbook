import {AxiosResponse} from "axios";
import {OptionsRequestType} from "../../request-options";
import {MethodsAxios} from "../../methods";

export default function (methods: MethodsAxios) {

    function createMessage(user: string, chatID: string, data: { content: string }, token: string): Promise<AxiosResponse> {
        return methods.post('/users/:id/chats/:chatID/messages', data, {
            headers: {
                authorization: 'Bearer ' + token,
            },
            urlParams:{
                id: user,
                chatID
            }
        })
    }

    function readMessages(user: string, chatID: string, data: { messages: Array<string> }, token: string): Promise<AxiosResponse> {
        return methods.put('/users/:id/chats/:chatID/messages', data, {
            headers: {
                authorization: 'Bearer ' + token,
            },
            urlParams:{
                id: user,
                chatID
            }
        })
    }

    function all(user: string, chatID: string, token: string, options?: OptionsRequestType): Promise<AxiosResponse> {
        return methods.get('/users/:id/chats/:chatID/messages', {
            cancelToken: options?.cancelToken,
            headers: {
                authorization: 'Bearer ' + token,
            },
            urlParams:{
                id: user,
                chatID
            }
        })
    }

    return {
        createMessage,
        readMessages,
        all
    }
}