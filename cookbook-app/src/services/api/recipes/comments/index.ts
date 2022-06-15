import { AxiosResponse } from "axios"
import { getHeaderBearerAuthorization } from "../../utils"
import { OptionsRequestType } from "../../request-options"
import { MethodsAxios } from "../../methods"

export default function (methods: MethodsAxios) {

    function getReportedComment(token: string, options?: OptionsRequestType): Promise<AxiosResponse>  {
        return methods.get("/comments-reported", {
            cancelToken: options?.cancelToken,
            headers: {
                authorization: "Bearer " + token
            }
        })
    }

    function createComment(user: string, recipe: string, data: object, token?: string): Promise<AxiosResponse>  {
        return methods.post("/users/:userID/recipes/:recipeID/comments", data, {
            headers: getHeaderBearerAuthorization(token),
            urlParams:{
                userID: user,
                recipeID: recipe,
            }
        })
    }

    function updateComment(user: string, recipe: string, comment: string, token: string, options: {data?: {content: string}, action?: string}): Promise<AxiosResponse>  {
        return methods.patch("/users/:userID/recipes/:recipeID/comments/:commentID", options.data || {}, {
            headers: getHeaderBearerAuthorization(token),
            params: {
                action: options.action
            },
            urlParams:{
                userID: user,
                recipeID: recipe,
                commentID: comment,
            }
        })
    }

    function deleteComment(user: string, recipe: string, comment: string, token: string): Promise<AxiosResponse>  {
        return methods.erase("/users/:userID/recipes/:recipeID/comments/:commentID", {
            headers: {
                authorization: "Bearer " + token
            },
            urlParams:{
                userID: user,
                recipeID: recipe,
                commentID: comment,
            }
        })
    }

    function createResponse(user: string, recipe: string, comment: string, data: object, token?: string): Promise<AxiosResponse>  {
        return methods.post("/users/:userID/recipes/:recipeID/comments/:commentID/responses", data, {
            headers: getHeaderBearerAuthorization(token),
            urlParams:{
                userID: user,
                recipeID: recipe,
                commentID: comment,
            }
        })
    }

    return {
        getReportedComment,
        createComment,
        updateComment,
        deleteComment,
        createResponse
    }
}