import {AxiosResponse} from "axios";
import * as methods from "../../methods";

export function createMessage(user: string, chatID: string, data: { content: string }, token: string): Promise<AxiosResponse> {
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

export function readMessages(user: string, chatID: string, data: { messages: Array<string> }, token: string): Promise<AxiosResponse> {
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