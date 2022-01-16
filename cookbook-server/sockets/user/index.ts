import {Friend, User} from "../../models";
import {accessManager, tokensManager} from "../../controllers";
import {SignUp} from "../../models/schemas/user";
import {RBAC} from "../../modules/rbac";
import Role = RBAC.Role;
import {Types} from "mongoose";
import ObjectId = Types.ObjectId

enum UserState {
    ONLINE = 'online',
    OFFLINE = 'offline'
}

function setUserState(userState: UserState, _id: string, io: any): void {
    const _date = Date.now()
    User.updateOne({ _id }, { $set: { 'credential.lastAccess': (userState as UserState) === UserState.ONLINE ? 0: _date }})
        .then(result => {
            console.log('setUserState = ', result, ', userState ', userState)
            const _data =  {
                _id,
                online: (userState as UserState) === UserState.ONLINE,
                offline: (userState as UserState) === UserState.OFFLINE && _date
            }
            if(_data.online) io.emit('user:online:' + _id, _data)
            else io.emit('user:offline:' + _id, _data)
            console.log('Change user state = ', result)
        }, err => console.error(err))
}

type UserSessionSocket = { auth?: string, user?: { userID: string, _id: string, isAdmin?: boolean }, socketID: string }
const users: Array<UserSessionSocket> = []

export function getSocketIDs(excludeSocketIDs?: Array<string>): Array<string> {
    let _users: Array<UserSessionSocket> = users
    if(excludeSocketIDs) _users = _users.filter(uss => !excludeSocketIDs.includes(uss.socketID))
    return _users.map(uss => uss.socketID)
}

export function findAdminSocketIDs(): Array<string> {
    return users.filter(uss => uss.user && uss.user.isAdmin).map(uss => uss.socketID)
}

export function findConnectedUserBy(field: 'auth' | '_id' | 'userID' | 'socketID', value: any): { index: number, info: UserSessionSocket | undefined  } {
    let index: number = -1;
    switch (field){
        case "auth":
            index = users.findIndex(u => u.auth === value)
            break;
        case "_id":
            index = users.findIndex(u => u.user && u.user._id == value)
            break;
        case "userID":
            index = users.findIndex(u => u.user && u.user.userID === value)
            break;
        case "socketID":
            index = users.findIndex(u => u.socketID === value)
            break;
    }
    return { index: index, info: (index !== -1 ? users[index] : undefined) }
}

export function pushIfIsAbsentConnectedUser(io: any, socket: any): void {
    let auth = socket.handshake.auth
    if(auth.key) {
        let userBy = findConnectedUserBy('auth', auth.key)
        if(!userBy.info){
            users.push( { auth: auth.key, user: auth.userinfo, socketID: socket.id })
            let _id = auth.userinfo._id
            setUserState(UserState.ONLINE, _id, io)
        }
    }
    else users.push({ socketID: socket.id })
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
    let _id = _user.info && _user.info.user && _user.info.user._id
    if(_id) setUserState(UserState.OFFLINE, _id, io)
}

export default function (io: any, socket: any) {

    //CHECK USER ONLINE/OFFLINE
    socket.on('check:user:state', (id) => {
        let userBy = findConnectedUserBy('_id', id)
        const _data: {_id: string, online: boolean, offline: boolean | number} =
            { _id: id, online: userBy.index !== -1, offline: userBy.index === -1 }
        if(_data.online) socket.emit('user:online:' + id, _data)
        else {
            User.findOne()
                .where('_id').equals(id)
                .select('credential.lastAccess')
                .then(user => {
                    if (user) {
                        console.debug('Check last access = ', user)
                        _data.offline = user.credential.lastAccess
                        socket.emit('user:offline:' + id, _data)
                    }
                }, err => console.error(err))
        }

        console.debug('User ', id, ' is ', (_data.online ? 'online': 'offline'))
    })

    //CHECK USER FRIEND
    socket.on('check:user:friendship', (id) => {
        let userBy = findConnectedUserBy('auth', socket.handshake.auth.key)
        if(userBy.info && userBy.info.user) {
            let me = userBy.info.user._id
            Friend.findOne({ $or: [ { from: { $eq: me }, to: { $eq: id } }, { from: { $eq: id },  to: { $eq: me } } ]})
                .then(friendship => socket.emit('friendship:state:' + id, friendship), err => console.error(err))

            console.debug('check:user:friendship (id) =', id)
        }
    })

    socket.on('check:access-token', ( {_id, resourceID} ) => {
        if(!ObjectId.isValid(_id))  return socket.emit('access-token:errors', {description: 'User\'s Identifier is not valid.'})
        if(!ObjectId.isValid(resourceID))  return socket.emit('access-token:errors', {description: 'Resource Identifier is not valid.'})
        if(_id !== resourceID) return socket.emit('access-token:errors', {description: "You can't access to this resource"})

        const user = findConnectedUserBy('_id', _id)
        const accessToken = user.info && user.info.auth
        if(!accessToken) return socket.emit('access-token:errors', {description: 'Missing authorization.'})
        console.debug('accessToken ', accessToken)

        const decoded_token = tokensManager.checkValidityOfToken(accessToken);
        if(!decoded_token) return socket.emit('access-token:not-valid', {description: 'Token is expired. You request another.'})
        console.debug('decoded_token ', decoded_token)

        User.findOne()
            .where('signup').equals(SignUp.State.CHECKED)
            .where('_id').equals(_id)
            .then(user => {
                if (!user) return socket.emit('access-token:errors', {description: 'User is not found'});
                return socket.emit('access-token:valid', { role: accessManager.isAdminUser(user.credential) ? Role.ADMIN: Role.SIGNED, description: 'You can access to this resource'})
            }, err => socket.emit('access-token:errors', { description: err.message }))

    })
}