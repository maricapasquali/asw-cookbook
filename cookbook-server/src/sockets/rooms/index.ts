import {userInformation} from "./user";
import {Types} from "mongoose";
import ObjectId = Types.ObjectId
import {User} from "../../models";

enum Rooms {
    CHAT_ONE = 'chat-one',
    CHAT_GROUP = 'chat-group',
    ANONYMOUS = 'anonymous',
    ADMINS = 'admins',
    SIGNED = 'signed'
}

export default Rooms


export function joinUserRoom(socket: any): void {
    let userName = userInformation(socket).name
    let rooms = roomsOf(socket)
    rooms.forEach(room => socket.join(room))
    console.debug(userName + ' is connected. Rooms = ', socket.rooms, '\n--------------------')
}

export function containInAdminsRoom(io: any, socket: any): boolean {
    return containInRoom(io, Rooms.ADMINS, socket)
}

export function usersOnline(io: any): any[] {
    return Array.from(io.sockets.adapter.rooms.keys()).filter(id => ObjectId.isValid(id.toString()))
}

export function onConnect(io: any, socket: any): void {
    joinUserRoom(socket)

    let userIdsOnline = usersOnline(io)

    console.debug('Prev Online Users = ', userIdsOnline)
    socket.emit('all:users:online', userIdsOnline)

    if(socket.rooms.has(Rooms.ANONYMOUS)) io.emit('user:online')
    else {
        let userInfo = userInformation(socket)
        setUserState( {state: UserState.ONLINE, id: userInfo.id})
            .then(() =>  {
                io.emit('user:online', userInfo.id)
                console.debug('Change STATE: ( user = ', userInfo.id, ', state = ', UserState.ONLINE, ')')
            })
    }

    console.debug('On Connection: All Rooms = ', io.sockets.adapter.rooms, ', user online = ', userIdsOnline)
}


export function onDisconnect(io: any, socket: any): void {
    let userInfo = userInformation(socket)
    if(userInfo.id) {
        let room = io.sockets.adapter.rooms.get(userInfo.id)
        if(!room || room?.length === 0) {
            console.debug('Disconnected: ', userInfo.name)
            setUserState( {state: UserState.OFFLINE, id: userInfo.id})
                .then(({date}) => {
                    io.emit('user:offline', userInfo.id, date)
                    console.debug('Change STATE: ( user = ', userInfo.id, ', state = ', UserState.OFFLINE, ', date = ', date ,')')
                })
        } else {
            console.debug('Disconnected one connection: ', userInfo.name)
        }
    }
    else io.emit('user:offline')

    console.debug('On Disconnection: All Rooms = ', io.sockets.adapter.rooms ,', user online = ', usersOnline(io))
}

/* -- PRIVATE FUNCTION --- */
/**
 * List of all room for an user.
 * If user is
 *  - anonymous -> rooms = [anonymous]
 *  - admin -> rooms = [<USER-ID>, admins]
 *  - signed -> rooms = [<USER-ID>, signed]
 */
function roomsOf(socket: any): string[] {
    let user = userInformation(socket)
    let rooms: string[] = []
    if(user.id){
        rooms.push(user.id)
        if(user.admin) rooms.push(Rooms.ADMINS)
        else rooms.push(Rooms.SIGNED)
    }
    else rooms.push(Rooms.ANONYMOUS)
    return rooms
}

function containInRoom(io: any, room: Rooms, socket: any): boolean {
    return !!io.sockets.adapter.rooms.get(room)?.has(socket.id)
}

enum UserState {
    ONLINE = 'online',
    OFFLINE = 'offline'
}
function setUserState(payload: {state: UserState, id: string}): Promise<any> {
    const _date = Date.now()
    return User.updateOne({ _id: payload.id },
                         { $set: { 'credential.lastAccess': payload.state === UserState.ONLINE ? 0 : _date }})
               .then(result => Promise.resolve({...payload, date: _date, ...result}), err => Promise.reject(err))
}
