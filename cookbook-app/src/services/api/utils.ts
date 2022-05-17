import {AxiosRequestHeaders} from "axios";

export function getHeaderBearerAuthorization(token?: string): AxiosRequestHeaders {
    return token ? { authorization: 'Bearer ' + token } : {}
}