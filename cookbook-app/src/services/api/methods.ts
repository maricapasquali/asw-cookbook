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

        let userInfo = Session.userInfo()
        console.debug('User is logged = ', userInfo)
        if (err.response && err.response.status === 401 && userInfo && !originalConfig._retry && !originalConfig.url.includes('refreshToken')) {
            originalConfig._retry = true;
            try {
                const rs = await newAccessToken(userInfo._id,{ refresh_token: Session.refreshToken() }, Session.accessToken())
                const { access_token } = rs.data;
                console.debug("Interceptors : after refresh => access token = ", access_token)
                Session.setAccessToken(access_token)
                return instance({
                    ...originalConfig,
                    headers: {
                        authorization: 'Bearer ' + access_token,
                    }
                });
            } catch (_error) {
                console.error("Refresh token err: ", _error)
                if(_error.response && _error.response.status === 401) Session.end()
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