import {AxiosResponse} from "axios";

export default function (methods){

//use token
    function login(credential: {userID: string, password: string}): Promise<AxiosResponse> {
        return methods.post('/users/login',{},{
            headers: {
                authorization: 'Basic ' +
                    Buffer.from(credential.userID+':'+credential.password, 'utf-8')
                        .toString('base64')
            }
        })
    }

    function newAccessToken(id: string, data: { refresh_token: string }, token: string){
        return methods.put('/users/:id/refresh-token', data,{
            headers: {
                authorization: 'Bearer ' + token,
            },
            urlParams:{
                id: id
            }
        })
    }

//use token  (interceptors)
    function logout(id: string, token: string){
        return methods.erase('/users/:id/logout', {
            headers: {
                authorization: 'Bearer ' + token,
            },
            urlParams:{
                id: id
            }
        })
    }

    return {
        login,
        newAccessToken,
        logout
    }
}