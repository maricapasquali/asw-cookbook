import axios, {AxiosRequestConfig, AxiosResponse} from 'axios'
import * as variables from "../../../modules/hosting/variables"


export function head(pathname: string, config?: AxiosRequestConfig): Promise<AxiosResponse>{
    return axios.head(variables.server_origin + pathname, config)
}

export function get(pathname: string, config?: AxiosRequestConfig): Promise<AxiosResponse>{
    return axios.get(variables.server_origin + pathname, config)
}

export function post(pathname: string, data: any, config?: AxiosRequestConfig): Promise<AxiosResponse>{
    return axios.post(variables.server_origin + pathname, data, config)
}

export function put(pathname: string, data: any, config?: AxiosRequestConfig): Promise<AxiosResponse>{
    return axios.put(variables.server_origin + pathname, data, config)
}

export function erase(pathname: string, config?: AxiosRequestConfig): Promise<AxiosResponse>{
    return axios.delete(variables.server_origin + pathname, config)
}
