import { AxiosResponse } from "axios"
import { getHeaderBearerAuthorization } from "../../utils"
import { MethodsAxios } from "../../methods"

export default function (methods: MethodsAxios) {

    function like(user: string, recipe: string, token?: string, commentID?: string): Promise<AxiosResponse> {
        return methods.post("/users/:userID/recipes/:recipeID/likes", {}, {
            headers: getHeaderBearerAuthorization(token),
            params: {
                commentID: commentID
            },
            urlParams:{
                userID: user,
                recipeID: recipe,
            }
        })
    }

    function unLike(user: string, recipe: string, like: string, token?: string, commentID?: string): Promise<AxiosResponse> {
        return methods.erase("/users/:userID/recipes/:recipeID/likes/:likeID", {
            headers: getHeaderBearerAuthorization(token),
            params: {
                commentID: commentID
            },
            urlParams:{
                userID: user,
                recipeID: recipe,
                likeID: like
            }
        })
    }

    return {
        like,
        unLike
    }
}
