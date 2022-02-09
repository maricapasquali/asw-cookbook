import axios, {AxiosRequestConfig, AxiosResponse} from 'axios'
import store from '../store'

import {Server} from "./index";

declare module 'axios' {
    interface AxiosRequestConfig {
        urlParams?: Record<string, string>;
    }
}

const instance = axios.create({
    baseURL: process.env.VUE_APP_API_ORIGIN || Server.api.origin,
    headers: {
        "Content-Type": "application/json",
    },
})

instance.interceptors.request.use(function (config){
    if (!config.url) return config;
    let pathname = config.url;
    Object.entries(config.urlParams || {}).forEach(([k, v]) => pathname = pathname.replace(`:${k}`, encodeURIComponent(v)));
    console.debug("interceptors.request : pathname = ", pathname)
    return {
        ...config,
        baseURL: config.baseURL,
        url: pathname,
    };
})
instance.interceptors.response.use(function(res) {
        console.debug("interceptors.response : res = ", res.status)
        return res;
    },
    async function (err){
        const originalConfig = err.config;
        console.error("interceptors.response : err = ", err)

        let userIdentifier = store.getters['session/userIdentifier']
        console.debug('User is logged = ', !!userIdentifier)

        if (err.response?.status === 401 && userIdentifier && !originalConfig._retry && !originalConfig.url.includes('refresh-token')) {
            originalConfig._retry = true;
            return store.dispatch('session/requestNewAccessToken')
                .then(res => {
                    console.debug("Interceptors : result request  ", res)
                    if(res?.status === 200 || res?.status === 204) {
                        console.debug(
                            res?.status === 200 ? "Interceptors : Access token has been updated."
                                : (res?.status === 204 ? "Interceptors : Access token is still valid." : '')
                        )
                        return instance({ ...originalConfig, headers: { authorization: 'Bearer ' + res?.data.access_token } });
                    }
                    console.error("Interceptors : Refresh token err: ", res.response)
                    return Promise.reject(res);
                })
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
