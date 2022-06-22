import * as bcrypt from "bcrypt"
import { Server } from "socket.io"
import {
    io,
    Socket
} from "socket.io-client"
import * as express from "express"
import * as fs from "fs"
import * as path from "path"
import sockets from "../../src/sockets"
import { Hosting } from "cookbook-shared/libs/hosting"
import {
    Chat,
    User
} from "../../src/models"
import {
    ChatPopulationPipeline,
    IChat
} from "../../src/models/schemas/chat"
import Rooms from "../../src/sockets/rooms"
import { ChatInfo } from "../../src/sockets/chat"

type UserInfo = { _id: string, userID: string, isAdmin?: boolean }

const users: any[] = []; const clients: any[] = []

let numberOfConnectedClients = 0

let server: Server

const __password = "password"

const mario = {
    _id: "623b9fd54a142c245c6de539",
    information: {
        firstname: "mario",
        lastname: "rossi",
        email: "rossi.mario@gmail.com"
    },
    credential: {
        userID: "mario066",
        hash_password: bcrypt.hashSync(__password, 10)
    },
    signup: "checked"
}

const kyle = {
    _id: "623b9fd54a142c245c6de540",
    information: {
        firstname: "kyle",
        lastname: "smith",
        email: "kyle@gmail.com"
    },
    credential: {
        userID: "Kyle066",
        hash_password: bcrypt.hashSync(__password, 10)
    },
    signup: "checked"
}

const jason = {
    _id: "623b9fd54a142c245c6de541",
    information: {
        firstname: "jason",
        lastname: "smith",
        email: "jason@gmail.com"
    },
    credential: {
        userID: "jason-smith088",
        hash_password: bcrypt.hashSync(__password, 10)
    },
    signup: "checked"
}

const hannah = {
    _id: "623b9fd54a142c245c6de542",
    information: {
        firstname: "hannah",
        lastname: "smith",
        email: "hannah@gmail.com"
    },
    credential: {
        userID: "hannah-smith0",
        hash_password: bcrypt.hashSync(__password, 10)
    },
    signup: "checked"
}

const chats: any[] = []

const usersIntoDatabase: any[] = [mario, kyle, jason, hannah]

function createClient(uri: string, options: any, user?: UserInfo, withInvalidToken?: string | boolean): Socket {
    users.push({ client: users.length, user })
    const _option = { ...options }
    if (user) {
        const tokens = {
            access: withInvalidToken ? tokensManager.createToken(user, typeof withInvalidToken === "boolean" ? "0 seconds" : withInvalidToken) : tokensManager.createToken(user),
            refresh: tokensManager.createToken(user)
        }
        Object.assign(_option, {
            auth: {
                key: tokens.access,
                userinfo: user
            }
        })
        tokensManager.tokens(user._id)
            .append(tokens)
    }
    return io(uri, _option)
}

const optionsCreationClients = {
    autoConnect: false,
    withCredentials: true,
    rejectUnauthorized: false // because I am using a self-signed certificate
}

let indexClientInvalidToken

function setClients(uri: string): void {
    clients.splice(0)

    clients.push(...[
        createClient(uri, optionsCreationClients),
        createClient(uri, optionsCreationClients, { userID: mario.credential.userID, _id: mario._id }),
        createClient(uri, optionsCreationClients, { userID: kyle.credential.userID, _id: kyle._id }),
        createClient(uri, optionsCreationClients),
        createClient(uri, optionsCreationClients, { userID: jason.credential.userID, _id: jason._id }, true),
        createClient(uri, optionsCreationClients, { userID: hannah.credential.userID, _id: hannah._id })
    ])

    indexClientInvalidToken = 4

    clients.forEach(client => {
        const clientName = getUserInfoOfClient(client).userID
        client
            .on("connect", () => {
                numberOfConnectedClients += 1
                console.debug(`[Client ${clientName}]: Connected = ${client.connected}, # Clients connected = ${numberOfConnectedClients} `)
            })
            .on("disconnect", () => {
                numberOfConnectedClients -= 1
                console.debug(`[Client ${clientName}]: Disconnected = ${client.disconnected}, # Remaining clients connected = ${numberOfConnectedClients} `)
            })
    })
}

/* -- EXPORTED FUNCTIONALITY -- */
export function firedEvent(event: string) {
    return `Fired event is '${event}'. `
}

export namespace SocketEvent {
   export const USER_ONLINE = "user:online"
   export const USER_OFFLINE = "user:offline"
   export const ALL_USERS_ONLINE = "all:users:online"

   export const CHAT_ENTER = "enter"
   export const CHAT_LEAVE = "leave"
   export const CHAT_TYPING = "typing"
   export const CHAT_MESSAGES = "messages"
   export const CHAT_READ_MESSAGES = "read-messages"
   export const CHAT_PUSH_MESSAGES = "push-messages"
   export const CHAT_CHANGE_ROLE_OK = "chat:change:role:ok"
   export const CHAT_UNCHANGED_ROLE = "chat:unchanged:role"
   export const CHAT_USER_NOT_FOUND = "user:not-found"
   export const CHAT_USER_NOT_ENTERED = "user:not-entered"
   export const OPERATION_NOT_AUTHORIZED = "operation:not:authorized"
   export const CONNECT_ERROR = "connect_error"
}

export function insertSomeUsers(): Promise<any> {
    return User.insertMany(usersIntoDatabase)
}

export function startServer(): Promise<void> {
    return new Promise(resolve => {
        const serverPort: number = configuration.test["server-port"] || 3002
        const serverHostname: string = configuration.server.hostname
        const optionsHTTPS = {
            key: fs.readFileSync(path.join(__dirname, "..", "..", "sslcert", "privatekey.pem")),
            cert: fs.readFileSync(path.join(__dirname, "..", "..", "sslcert", "cert.pem"))
        }

        Hosting
            .createHttpsServer(express(), optionsHTTPS)
            .setHostName(serverHostname)
            .setPort(serverPort)
            .setSocket(httpsServer => {
                server = new Server(httpsServer, {
                    cors: {
                        origin: "*",
                        methods: ["GET", "POST"],
                        credentials: true
                    }
                })
                sockets(server)
            })
            .build()
            .listen(serverHosting => {
                console.debug(`Server listening on ${serverHosting.origin} ...`)
                setClients(serverHosting.origin)
                resolve()
            })
    })
}

export function connectClient(client: Socket): Promise<void> {
    return new Promise<void>((resolve, reject) =>
        client
            .connect()
            .on("connect", resolve)
            .on("connect_error", reject)
    )
}

export function disconnectClient(client: Socket): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        client.disconnect()
        if (client.disconnected) resolve()
        else reject("Client is not disconnected")
    })
}

export function connectAllClients(): Promise<void> {
    return new Promise((resolve, reject) => {
        clients.forEach((client, index) => {
            if (index != indexClientInvalidToken) {
                client
                    .connect()
                    .on("connect", () => {
                        if (clients.length - 1 === numberOfConnectedClients) resolve()
                    })
                    .on("connect_error", reject)
            }
        })
    })
}

export function disconnectAllClients(): Promise<void> {
    return new Promise((resolve, reject) => {
        clients.forEach(client => client.disconnect())
        if (clients.every(client => client.disconnected) && numberOfConnectedClients === 0) resolve()
        else reject("Not all clients are disconnected.")
    })
}

export function closeSockets(): Promise<void[]> {
    const _disconnectAllClients = disconnectAllClients()
    const _closeServer = new Promise<void>((resolve, reject) => {
        server.close(err => {
            if (err) reject(err)
            else resolve()
        })
    })
    return Promise.all([_disconnectAllClients, _closeServer])
}

export function subscribeEvent(options: { client: Socket, method?: "once" | "on", event: string, filter?: (...args: any[]) => boolean, assertionHandler?: (...args: any[]) => void }): Promise<void> {
    options.method = options.method || "once"
    options.filter = options.filter || (() => true)
    options.assertionHandler = options.assertionHandler || (() => {
        console.debug("ignored assertionHandler .")
    })

    return new Promise((resolve, reject) => {
        function handler(...args: any[]): void {
            if (options.filter(...args)) {
                try {
                    options.assertionHandler(...args)
                    console.debug(`[Client ${getUserInfoOfClient(options.client).userID}]: Checked Event = '${options.event}' with args = `, ...args)
                    resolve()
                } catch (e) {
                    reject(e)
                } finally {
                    if (options.method === "on") options.client.off(options.event, handler)
                }
            }
        }
        switch (options.method) {
            case "once":
                options.client.once(options.event, handler)
                break
            case "on":
                options.client.on(options.event, handler)
                break
        }
    })
}

export function subscribeEventOnce(client: Socket, event: string, assertionHandler: (...args: any[]) => void): Promise<void> {
    return subscribeEvent({ client, event, assertionHandler, method: "once" })
}

export function subscribeEventOn(client: Socket, event: string, assertionHandler: (...args: any[]) => void, filter?: (...args: any[]) => boolean): Promise<void> {
    return subscribeEvent({ client, event, assertionHandler, method: "on", filter })
}

export function filterOnlineClients(excludedClient: Socket): Socket[] {
    return clients.filter(c => c != excludedClient)
        .filter(c => c.connected)
}

export function getClient(position: number): Socket {
    return clients[position]
}

export function createNewClientFrom(position: number, invalidToken?: string | boolean) : Socket {
    const prev: Socket = clients[position]
    if (prev) return createClient((prev.io as any).uri, optionsCreationClients, (prev.auth as any)?.userinfo, invalidToken)
}

export function getUserIdentifierOfClient(position: number): string {
    return users.find(u => u.client === position)?.user?._id
}

export function getUserInfoOfClient(cl: Socket): UserInfo {
    return (cl?.auth as any)?.userinfo || { _id: null, userID: "anonymous" }
}

export function maxClients(): number {
    return clients.length - 1
}

// CHATS
export function insertSomeChats(): Promise<any> {
    return Chat.insertMany([
        { info: { type: IChat.Type.ONE }, users: [{ user: kyle._id }, { user: mario._id }] },
        { info: { type: IChat.Type.GROUP, name: "super-friends" }, users: [{ user: kyle._id }, { user: mario._id }, { user: hannah._id }] }
    ])
        .then(_chats => {
            if (_chats.length === 0) return Promise.reject(new Error("No chat was inserted"))
            return Promise.all(_chats.map(chat => chat.populate(ChatPopulationPipeline)
                .execPopulate()))
                .then(popChats => {
                    chats.push(...(
                        popChats.map(chat => chat.toObject())
                            .map(chat => {
                                return Object.assign(chat, {
                                    _id: chat._id.toString(),
                                    users: chat.users.map(u => {
                                        u.user._id = u.user._id.toString()
                                        return u
                                    })
                                })
                            })
                    ))
                })
        })
}

export function getChatInfo(type: IChat.Type): ChatInfo {
    const chat = chats.find(c => c.info.type === type)
    if (!chat) throw new Error("Chat is not found. Type = " + type)
    return {
        _id: chat._id,
        info: {
            type: chat.info.type,
            name: chat.info.name,
            usersRole: chat.users.map(u => ({ user: u.user._id, role: u.role }))
        },
        users: chat.users.map(u => u.user)
    }
}

export function getUserInfoOfClientInChat(cl: Socket, type: IChat.Type): UserInfo {
    return (getClientsOnChat(type)
        .find(c => c == cl)?.auth as any)?.userinfo
}

export function getClientsOnChat(type: IChat.Type, filter?: (client: Socket) => boolean): Socket[] {
    const _usersInChat: string[] = getChatInfo(type).users.map(u => u._id)
    const _clients = clients.filter(c => _usersInChat.includes(c.auth?.userinfo?._id))
    return filter ? _clients.filter(filter) : _clients
}

export function allUsersEnterInChat(type: IChat.Type, ...excludeClient: Socket[]): Promise<any> {
    return Promise.all(
        getClientsOnChat(type)
            .filter(c => !excludeClient.includes(c))
            .map(client => enterInChat(client, type))
    )
        .then(results => {
            const dist = new Set(results)
            if (dist.size === 1) return { chatName: results[0] }
            throw new Error("More chats are selected .")
        })
}

export function enterInChat(client: Socket, type: IChat.Type): Promise<any> {
    return new Promise<any>((resolve, reject) => {
        client
            .emit("chat:enter", getChatInfo(type))
            .once(SocketEvent.CHAT_ENTER, ({ chatName }) => resolve(chatName))
            .once(SocketEvent.CHAT_USER_NOT_FOUND, () => reject({ event: SocketEvent.CHAT_USER_NOT_FOUND }))
            .once(SocketEvent.OPERATION_NOT_AUTHORIZED, () => reject({ event: SocketEvent.OPERATION_NOT_AUTHORIZED }))
    })
}
//-----------------------------------------------------------
export function allUsersLeaveChat(type: IChat.Type): Promise<void> {
    return new Promise<void>(resolve => {
        getClientsOnChat(type)
            .forEach(client => client.emit("chat:leave", getChatInfo(type)))
        resolve()
    })
}

export function getExceptedChatName(type: IChat.Type): string {
    const _chat = getChatInfo(type)
    if (_chat) {
        switch (type) {
            case IChat.Type.ONE: return [Rooms.CHAT_ONE, _chat._id].join("-")
            case IChat.Type.GROUP: return [Rooms.CHAT_GROUP, _chat._id].join("-")
        }
    }
}

export function getExceptedChatInfo(type: IChat.Type): any {
    const _chat = getChatInfo(type)
    if (_chat) {
        return {
            _id: _chat._id,
            ..._chat.info
        }
    }
}

export function message(sender: string): any {
    return ({
        sender: { _id: sender },
        content: "examples message"
    })
}

function randomInteger(min: number, max: number): number {
    max *= 1000; min *= 1000
    return Math.floor(Math.random() * (max - min + 1)) + min
}

export function readMessage(sender: string, ...receivers: string[]): any {
    return ({
        ...message(sender),
        read: receivers.map((r, index) => ({ user: { _id: r }, timestamp: Date.now() - (index < receivers.length - 1 ? randomInteger(1000, 5000) : 0) }))
    })
}
