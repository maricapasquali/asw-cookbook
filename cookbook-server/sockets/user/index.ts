import {Friend} from "../../models";

type UserSessionSocket = { auth: string, user: { userID: string, _id: string, isAdmin?: boolean }, socketID: string }
const users: Array<UserSessionSocket> = []

export function findConnectedUserBy(field: 'auth' | '_id' | 'userID', value: any): { index: number, info: UserSessionSocket | undefined  } {
    let index: number = -1;
    switch (field){
        case "auth":
            index = users.findIndex(u => u.auth === value)
            break;
        case "_id":
            index = users.findIndex(u => u.user._id === value)
            break;
        case "userID":
            index = users.findIndex(u => u.user.userID === value)
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
            io.emit('user:online:' + _id, { online: true, _id: _id })
        }
    }
}

export function popConnectedUser(io: any, field: 'auth' | '_id' | 'userID' | 'index', value: any): void {
    let _user:  { info: UserSessionSocket, index: number }
    if(field === 'index') {
        _user = {info: users[value], index: value}
        if(value !== -1) users.splice(value, 1)
    }
    else {
        _user = findConnectedUserBy(field, value)
        if(_user.index !== -1) users.splice(_user.index, 1)
    }
    let _id = _user.info.user._id
    io.emit('user:offline:' + _user.info.user._id, { online: false, _id: _id })
}

export default function (io: any, socket: any) {

    //CHECK USER ONLINE/OFFLINE
    socket.on('check:user:state', (id) => {
        let userBy = findConnectedUserBy('_id', id)
        let _data = { _id: id, online: userBy.index != -1 }
        if(_data.online) socket.emit('user:online:' + id, _data)
        else socket.emit('user:offline:' + id, _data)

        console.debug('User ', id, ' is ', (_data.online ? 'online': 'offline'))
    })

    //CHECK USER FRIEND
    socket.on('check:user:friendship', (id) => {
        let userBy = findConnectedUserBy('auth', socket.handshake.auth.key)
        if(userBy.info) {
            let me = userBy.info.user._id
            Friend.findOne({ $or: [ { from: { $eq: me }, to: { $eq: id } }, { from: { $eq: id },  to: { $eq: me } } ]})
                  .then(friendship => socket.emit('friendship:state:' + id, friendship), err => console.error(err))

            console.debug('check:user:friendship (id) =', id)
        }
    })

}