import {User} from "../models";
import {tokensManager} from "../controllers";

enum UserState {
    ONLINE = 'online',
    OFFLINE = 'offline'
}

function setUserState(userState: UserState, _id: string, io: any): void {
    const _date = Date.now()
    User.updateOne({ _id }, { $set: { 'credential.lastAccess': (userState as UserState) === UserState.ONLINE ? 0: _date }})
        .then(result => {
            switch (userState){
                case UserState.ONLINE:
                    io.emit('user:online', _id)
                    console.log('Change STATE: ( user = ', _id, ', state = ', UserState.ONLINE, ')')
                    break
                case UserState.OFFLINE:
                    io.emit('user:offline', _id, _date)
                    console.log('Change STATE: ( user = ', _id, ', state = ', UserState.OFFLINE, ', date = ', _date ,')')
                    break
            }
        }, err => console.error(err))
}

type UserSessionSocket = { auth?: string, user?: { userID: string, _id: string, isAdmin?: boolean }, socketID: string }
const users: Array<UserSessionSocket> = []

export function findAdminSocketIDs(): Array<string> {
    return users.filter(uss => uss.user && uss.user.isAdmin).map(uss => uss.socketID)
}

export function findAnonymousSocketIDs(): Array<string> {
    return users.filter(uss => !uss.user).map(uss => uss.socketID)
}

export function findConnectedUserBy(field: 'auth' | '_id' | 'userID' | 'socketID', value: any): { index: number, info: UserSessionSocket | undefined  } {
    let index: number = -1;
    switch (field){
        case "auth":
            index = users.findIndex(u => u.auth === value)
            break;
        case "_id":
            index = users.findIndex(u => u.user?._id == value)
            break;
        case "userID":
            index = users.findIndex(u => u.user?.userID === value)
            break;
        case "socketID":
            index = users.findIndex(u => u.socketID === value)
            break;
    }
    return { index: index, info: (index !== -1 ? users[index] : undefined) }
}

export function pushIfIsAbsentConnectedUser(io: any, socket: any): void {
    let userIdsOnline = users.map(u => u.user?._id)
    console.debug('USERS ONLINES = ', userIdsOnline)
    socket.emit('all:users:online', userIdsOnline)

    let auth = socket.handshake.auth
    if(auth.key) {
        let userBy = findConnectedUserBy('auth', auth.key)
        if(!userBy.info){
            users.push( { auth: auth.key, user: auth.userinfo, socketID: socket.id })
            let _id = auth.userinfo._id
            setUserState(UserState.ONLINE, _id, io)
        }
    }
    else {
        users.push({ socketID: socket.id })
        io.emit('user:online')
    }
}

export function popConnectedUser(io: any, field: 'auth' | '_id' | 'userID' | 'index' | 'socketID', value: any): void {
    let _user:  { info: UserSessionSocket, index: number }
    if(field === 'index') {
        _user = {info: users[value], index: value}
        if(value !== -1) users.splice(value, 1)
    }
    else {
        _user = findConnectedUserBy(field, value)
        if(_user.index !== -1) users.splice(_user.index, 1)
    }
    let _id = _user.info?.user?._id
    if(_id) setUserState(UserState.OFFLINE, _id, io)
    else io.emit('user:offline')
}

export function checkAuthorization(socket: any): void | boolean {
    const user = findConnectedUserBy('socketID', socket.id)
    const accessToken = user.info?.auth
    let isAuthorized = tokensManager.checkValidityOfToken(accessToken)
    if(isAuthorized === false) {
        let message = 'You are not authorized to perform this operation.'
        let expired = accessToken && !tokensManager.isInRevokeList(accessToken)
        console.debug('Message = ', message, ', expired = ', expired)
        socket.emit('operation:not:authorized', { message, expired })
    }
    return isAuthorized !== false
}
