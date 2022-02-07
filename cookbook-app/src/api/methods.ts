import axios, {AxiosRequestConfig, AxiosResponse} from 'axios'
import * as variables from "../../../modules/hosting/variables"
import store from '../store'
import {newAccessToken} from "./users/session";

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

        let userIdentifier = store.getters.userIdentifier
        console.debug('User is logged = ', userIdentifier)

        if (err.response && err.response.status === 401 && userIdentifier && !originalConfig._retry && !originalConfig.url.includes('refresh-token')) {
            originalConfig._retry = true;
            try {
                const oldAccessToken = store.getters.accessToken
                const refreshToken = store.getters.refreshToken

                const rs = await newAccessToken(userIdentifier,{ refresh_token: refreshToken }, oldAccessToken)
                const { access_token } = rs.data;
                console.debug("Interceptors : after refresh => access token = ", access_token)

                store.commit('session/set-access-token', access_token)

                return instance({
                    ...originalConfig,
                    headers: {
                        authorization: 'Bearer ' + access_token,
                    }
                });
            } catch (_error) {
                console.error("Refresh token err: ", _error)
                if(_error.response && _error.response.status === 401) store.dispatch('reset')
                return Promise.reject(_error);
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