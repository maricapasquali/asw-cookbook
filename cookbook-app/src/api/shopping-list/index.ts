import {AxiosResponse} from "axios";
import {MethodsAxios} from "../methods";

export default function (methods: MethodsAxios) {

    function createShoppingListPoint(user: string, data: object, token: string): Promise<AxiosResponse>  {
        return methods.post('/users/:userID/shopping-list', data,{
            headers: {
                authorization: 'Bearer ' + token
            },
            urlParams:{
                userID: user
            }
        })
    }

    function getShoppingList(user: string, token: string): Promise<AxiosResponse>  {
        return methods.get('/users/:userID/shopping-list', {
            headers: {
                authorization: 'Bearer ' + token
            },
            urlParams:{
                userID: user
            }
        })
    }

    function updateShoppingListPoint(user: string, point: string, data: object, token: string): Promise<AxiosResponse>  {
        return methods.patch('/users/:userID/shopping-list/:pointID', data,{
            headers: {
                authorization: 'Bearer ' + token
            },
            urlParams:{
                userID: user,
                pointID: point
            }
        })
    }

    function deleteShoppingListPoint(user: string, point: string, token: string): Promise<AxiosResponse>  {
        return methods.erase('/users/:userID/shopping-list/:pointID', {
            headers: {
                authorization: 'Bearer ' + token
            },
            urlParams:{
                userID: user,
                pointID: point
            }
        })
    }

    return {
        createShoppingListPoint,
        getShoppingList,
        updateShoppingListPoint,
        deleteShoppingListPoint
    }
}