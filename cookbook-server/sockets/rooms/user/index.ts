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

type PreviousEmittedEvent = { event: string, args?: any[] }

function createError(userInformation: UserInformationType, previousEmittedEvent?: PreviousEmittedEvent): ExtendedError {
    let message = 'You are not authorized to perform this operation.'
    let expired = userInformation.accessToken && tokensManager.isExpired(userInformation.accessToken)
    let error: ExtendedError = new Error(message)
    error.data = { expired, previousEmittedEvent }
    console.error('User ', userInformation.name, ' : ', message, ', expired = ', expired, ', previous emitted event = ', previousEmittedEvent)
    return error
}

/**
 * Middleware to check if authentication token (when present) is valid on connection.
 */
export function middlewareCheckAuthorization(socket: any, next: (err?: ExtendedError) => void): void {
    const {id} = userInformation(socket)
    if(id) middlewareCheckNoAnonymous(socket, next, { previousEmittedEvent: {event: 'connect' } })
    else next()
}

export function middlewareCheckNoAnonymous(socket: any, next: (err?: ExtendedError) => void, options?: { previousEmittedEvent?: PreviousEmittedEvent }): void {
    const userInfo = userInformation(socket)
    if(tokensManager.checkValidityOfToken(userInfo.accessToken) === false) {
        next(createError(userInfo, options?.previousEmittedEvent))
    } else {
        next()
    }
}
