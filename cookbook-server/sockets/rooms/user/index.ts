import {tokensManager} from "../../../controllers/utils.controller";
import {ExtendedError} from "socket.io/dist/namespace";

export type UserInformationType = {
    id?: string,
    name: string,
    admin: boolean,
    accessToken?: string
}
export function userInformation(socket: any): UserInformationType {
    return {
        id: socket.handshake.auth.userinfo?._id,
        name: (socket.handshake.auth.userinfo?.userID || 'Anonymous'),
        admin: !!socket.handshake.auth.userinfo?.isAdmin,
        accessToken: socket.handshake.auth.key,
    }
}

function createError(userInformation: UserInformationType): ExtendedError {
    let message = 'You are not authorized to perform this operation.'
    let expired = userInformation.accessToken && !tokensManager.tokens(userInformation.id).isRevoked({access: userInformation.accessToken})
    let error: ExtendedError = new Error(message)
    error.data = { expired }
    console.error('User ', userInformation.name, ' : ', message, ', expired = ', expired)
    return error
}

/**
 * Middleware to check if authentication token (when present) is valid on connection.
 */
export function middlewareCheckAuthorization(socket: any, next: (err?: ExtendedError) => void): void {
    const {id} = userInformation(socket)
    if(id) middlewareCheckNoAnonymous(socket, next)
    else next()
}

export function middlewareCheckNoAnonymous(socket: any, next: (err?: ExtendedError) => void): void {
    const userInfo = userInformation(socket)
    if(tokensManager.checkValidityOfToken(userInfo.accessToken) === false) {
        next(createError(userInfo))
    } else {
        next()
    }
}
