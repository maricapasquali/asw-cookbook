import axios, {AxiosRequestConfig, AxiosResponse} from 'axios'
import store from '../store'

declare module 'axios' {
    interface AxiosRequestConfig {
        urlParams?: Record<string, string>;
    }
}

export type MethodsAxios = {
    info: any,
    head: (pathname: string, config?: AxiosRequestConfig) => Promise<AxiosResponse>,
    get: (pathname: string, config?: AxiosRequestConfig) => Promise<AxiosResponse>,
    post: (pathname: string, data: any, config?: AxiosRequestConfig) => Promise<AxiosResponse>,
    patch: (pathname: string, data: any, config?: AxiosRequestConfig) => Promise<AxiosResponse>,
    put: (pathname: string, data: any, config?: AxiosRequestConfig) => Promise<AxiosResponse>,
    erase: (pathname: string, config?: AxiosRequestConfig) => Promise<AxiosResponse>
}

export default function (serverConfiguration): MethodsAxios {
    const subDomain = serverConfiguration['sub-domain']

    const _serverInfo = {
        api: {
            pathname: subDomain.api.pathname
        },
        images: {
            pathname: subDomain.images.pathname,
            path: function (endPoint){
                return _path(this.pathname, endPoint)
            }
        },
        videos: {
            pathname: subDomain.videos.pathname,
            path: function (endPoint){
                return _path(this.pathname, endPoint)
            }
        }
    }

    const instance = axios.create({
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

    function head(pathname: string, config?: AxiosRequestConfig): Promise<AxiosResponse>{
        return instance.head(_serverInfo.api.pathname + pathname, config)
    }

    function get(pathname: string, config?: AxiosRequestConfig): Promise<AxiosResponse>{
        return instance.get(_serverInfo.api.pathname + pathname, config)
    }

    function post(pathname: string, data: any, config?: AxiosRequestConfig): Promise<AxiosResponse>{
        return instance.post(_serverInfo.api.pathname + pathname, data, config)
    }

    function patch(pathname: string, data: any, config?: AxiosRequestConfig): Promise<AxiosResponse>{
        return instance.patch(_serverInfo.api.pathname + pathname, data, config)
    }

    function put(pathname: string, data: any, config?: AxiosRequestConfig): Promise<AxiosResponse>{
        return instance.put(_serverInfo.api.pathname + pathname, data, config)
    }

    function erase(pathname: string, config?: AxiosRequestConfig): Promise<AxiosResponse>{
        return instance.delete(_serverInfo.api.pathname + pathname, config)
    }


    function _path(origin: string, endPoint: string): string {
        if(endPoint.search(origin) !== -1) return endPoint
        return `${origin}/${endPoint}`
    }

    return {
        info: { ..._serverInfo },

        head,
        get,
        post,
        patch,
        put,
        erase
    }
}
