import {tokensManager} from "../../../controllers/utils.controller";

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

export function checkAuthorization(socket: any): void | boolean {
    const {accessToken, id} = userInformation(socket)
    let isAuthorized = tokensManager.checkValidityOfToken(accessToken)
    if(isAuthorized === false) {
        let message = 'You are not authorized to perform this operation.'
        let expired = accessToken && !tokensManager.tokens(id).isRevoked({access: accessToken})
        console.debug('Message = ', message, ', expired = ', expired)
        socket.emit('operation:not:authorized', { message, expired })
    }
    return isAuthorized !== false
}
