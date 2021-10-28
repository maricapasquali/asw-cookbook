import axios, {AxiosRequestConfig, AxiosResponse} from 'axios'
import * as variables from "../../../../modules/hosting/variables"
import {Session} from "../session";

declare module 'axios' {
    interface AxiosRequestConfig {
        urlParams?: Record<string, string>;
    }
}

const instance = axios.create({
    baseURL: process.env.VUE_APP_SERVER_ORIGIN || variables.server_origin,
    headers: {
        "Content-Type": "application/json",
    },
})

//use token
function newAccessToken(id: string, data:object, token: string){
    return instance.post('/users/:id/refreshToken', data,{
        headers: {
            authorization: 'Bearer ' + token,
        },
        urlParams:{
            id: id
        }
    })
}

instance.interceptors.request.use(function (config){
    if (!config.url) return config;
    var pathname = config.url
    Object.entries(config.urlParams || {}).forEach(([k, v]) => pathname = pathname.replace(`:${k}`, encodeURIComponent(v)));
    console.log("interceptors.request : pathname = ", pathname)
    return {
        ...config,
        baseURL: config.baseURL,
        url: pathname,
    };
})
instance.interceptors.response.use(function(res) {
        console.log("interceptors.response : res = ", res.status)
        return res;
    },
    async function (err){
        const originalConfig = err.config;
        console.error("interceptors.response : err = ", err)
        if (err.response && originalConfig.urlParams && originalConfig.urlParams.id ) {
            // Access Token was expired
            if (err.response.status === 401 && !originalConfig._retry && !originalConfig.url.includes('refreshToken')) {
                originalConfig._retry = true;
                try {
                    let id = originalConfig.urlParams.id
                    const rs = await newAccessToken(id,{ refresh_token: Session.refreshToken() }, Session.accessToken())
                    const { access_token } = rs.data;
                    console.log("Interceptors : after refresh => access token = ", access_token)
                    Session.setAccessToken(access_token)
                    return instance({
                        ...originalConfig,
                        headers: {
                            authorization: 'Bearer ' + access_token,
                        }
                    });
                } catch (_error) {
                    console.error("Refresh token err: ", _error)
                    return Promise.reject(_error);
                }
            }
        }

        return Promise.reject(err);
    }
);

export function head(pathname: string, config?: AxiosRequestConfig): Promise<AxiosResponse>{
    return instance.head(pathname, config)
}

export function get(pathname: string, config?: AxiosRequestConfig): Promise<AxiosResponse>{
    return instance.get(pathname, config)
}

export function post(pathname: string, data: any, config?: AxiosRequestConfig): Promise<AxiosResponse>{
    return instance.post(pathname, data, config)
}

export function patch(pathname: string, data: any, config?: AxiosRequestConfig): Promise<AxiosResponse>{
    return instance.patch(pathname, data, config)
}

export function put(pathname: string, data: any, config?: AxiosRequestConfig): Promise<AxiosResponse>{
    return instance.put(pathname, data, config)
}

export function erase(pathname: string, config?: AxiosRequestConfig): Promise<AxiosResponse>{
    return instance.delete(pathname, config)
}

export default instance