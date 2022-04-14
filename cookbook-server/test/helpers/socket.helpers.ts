import * as bcrypt from 'bcrypt';
import {Server} from "socket.io";
import {io, Socket} from "socket.io-client";
import * as express from "express";
import * as fs from "fs";
import * as  path from "path";
import sockets from "../../sockets";
import * as env from "../../../environment/env.config";
import {Hosting} from "../../../commons/modules/hosting";
import {Chat, User} from "../../models";
import {tokensManager} from "../../controllers/utils.controller";
import {ChatPopulationPipeline, IChat} from "../../models/schemas/chat";
import Rooms from "../../sockets/rooms";
import {ChatInfo} from "../../sockets/chat";

type UserInfo = { _id: string, userID: string, isAdmin?: boolean }

const users: any[] = [], clients: any[] = []

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

const usersIntoDatabase: any[] = [ mario, kyle, jason, hannah ]

const createClient = (uri: string, options: any, user?: UserInfo, withInvalidToken?: string | boolean): Socket => {
    users.push({ client: users.length, user })
    let _option = {...options}
    if(user) {
        let tokens =  {
            access: withInvalidToken ? tokensManager.createToken(user, typeof withInvalidToken === "boolean" ? "0 seconds": withInvalidToken) : tokensManager.createToken(user),
            refresh: tokensManager.createToken(user)
        }
        Object.assign(_option,{
            auth: {
                key: tokens.access,
                userinfo: user
            }
        })
        tokensManager.tokens(user._id).append(tokens)
    }
    return io(uri, _option)
}

const optionsCreationClients = {
    autoConnect: false,
    withCredentials: true,
    rejectUnauthorized: false // because I am using a self-signed certificate
}

let indexClientInvalidToken;

const setClients = (uri: string) =>{

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
        let clientName = getUserInfoOfClient(client).userID
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
export const firedEvent = event => `Fired event is '${event}'. `

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


export const insertSomeUsers = (): Promise<any> => User.insertMany(usersIntoDatabase)

export const startServer = (): Promise<void> => new Promise((resolve, reject) => {

    const serverPort: number = env.server.port
    const serverHostname: string = env.server.hostname
    const optionsHTTPS = {
        key: fs.readFileSync(path.join(__dirname, "..", "..", "sslcert", "privatekey.pem")),
        cert: fs.readFileSync(path.join(__dirname, "..", "..", "sslcert", "cert.pem")),
    }

    Hosting
        .createHttpsServer(express(), optionsHTTPS)
        .setHostName(serverHostname)
        .setPort(serverPort)
        .setSocket((httpsServer) => {
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
        .listen((serverHosting) => {
            console.debug(`Server listening on ${serverHosting.origin} ...`)
            setClients(serverHosting.origin)
            resolve()
        })
})

export const connectClient = (client: Socket) => new Promise<void>((resolve, reject) => client.connect().on("connect", resolve).on("connect_error", reject))

export const disconnectClient = (client: Socket) => new Promise<void>((resolve, reject) => {
    client.disconnect()
    if(client.disconnected) resolve()
    else reject("Client is not disconnected")
})

export const connectAllClients = (): Promise<void> => new Promise((resolve, reject) => {
    clients.forEach((client, index) => {
            if (index != indexClientInvalidToken) {
                client.connect().on("connect", () => {
                    if(clients.length - 1 === numberOfConnectedClients ) resolve()
                })
                .on("connect_error", reject)
            }
    })
})

export const disconnectAllClients = (): Promise<void> => new Promise((resolve, reject) => {
    clients.forEach(client => client.disconnect())
    if(clients.every(client => client.disconnected) && 0 === numberOfConnectedClients) resolve()
    else reject("Not all clients are disconnected.")
})

export const closeSockets = (): Promise<void[]> => {
    let _disconnectAllClients = disconnectAllClients()
    let _closeServer = new Promise<void>((resolve, reject) => {
        server.close(err => {
            if(err) reject(err)
            else resolve()
        })
    })
    return Promise.all([_disconnectAllClients, _closeServer])
}

export const subscribeEvent = ( options: { client: Socket, method?: "once" | "on", event: string, filter?: (...args: any[]) => boolean, assertionHandler?: (...args: any[]) => void } ): Promise<void> => {
    options.method = options.method || "once"
    options.filter = options.filter || (() => true)
    options.assertionHandler = options.assertionHandler || (() => {
        console.log("ignored assertionHandler .")
    })

    return new Promise((resolve, reject) => {
        let handler = (...args) => {
            if(options.filter(...args)){
                try {
                    options.assertionHandler(...args)
                    console.debug(`[Client ${getUserInfoOfClient(options.client).userID}]: Checked Event = '${options.event}' with args = `,  ...args)
                    resolve()
                }catch (e){
                    reject(e)
                } finally {
                    if(options.method === "on") options.client.off(options.event, handler)
                }
            }
        }
        switch (options.method){
            case "once":
                options.client.once(options.event, handler);
                break
            case "on":
                options.client.on(options.event, handler);
                break
        }
    })
}

export const subscribeEventOnce = (client: Socket, event: string, assertionHandler: (...args: any[]) => void): Promise<void> => subscribeEvent({ client, event, assertionHandler,  method: "once" })

export const subscribeEventOn = (client: Socket, event: string, assertionHandler: (...args: any[]) => void, filter?: (...args: any[]) => boolean): Promise<void> => subscribeEvent({ client, event, assertionHandler, method: "on", filter })

export const filterOnlineClients = (excludedClient: Socket): Socket[] => clients.filter(c => c != excludedClient).filter(c => c.connected)

export const getClient = (position: number): Socket => clients[position]

export const createNewClientFrom = (position: number, invalidToken?: string | boolean) : Socket => {
    let prev: Socket = clients[position]
    if(prev) return createClient((prev.io as any).uri, optionsCreationClients, (prev.auth as any)?.userinfo, invalidToken)
}

export const getUserIdentifierOfClient = (position: number): string => users.find(u => u.client === position)?.user?._id

export const getUserInfoOfClient = (cl: Socket): UserInfo => (cl?.auth as any)?.userinfo || {_id: null, userID: "anonymous"}

export const maxClients = (): number => clients.length - 1

//CHATS
export const insertSomeChats = (): Promise<any> => {
    return Chat.insertMany([
        { info: { type: IChat.Type.ONE }, users: [ {user: kyle._id}, {user: mario._id} ] },
        { info: { type: IChat.Type.GROUP, name: "super-friends"},  users: [ {user: kyle._id}, {user: mario._id}, {user: hannah._id} ] }
    ]).then(_chats => {
        if(_chats.length === 0) return Promise.reject(new Error("No chat was inserted"))
        return Promise.all( _chats.map(chat => chat.populate(ChatPopulationPipeline).execPopulate()))
                      .then(popChats => {
                          chats.push(...(
                              popChats.map(chat => chat.toObject()).map(chat => {
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

export const getChatInfo = (type: IChat.Type): ChatInfo => {
    let chat = chats.find(c => c.info.type === type)
    if(!chat) throw new Error("Chat is not found. Type = "+type)
    return {
        _id: chat._id,
        info: {
            type: chat.info.type,
            name: chat.info.name,
            usersRole: chat.users.map(u => ({user: u.user._id, role: u.role}))
        },
        users: chat.users.map(u => u.user)
    }
}

export const getUserInfoOfClientInChat = (cl: Socket, type: IChat.Type): UserInfo => (getClientsOnChat(type).find(c => c == cl)?.auth as any)?.userinfo

export const getClientsOnChat = (type: IChat.Type, filter?: (client: Socket) => boolean): Socket[] => {
    let _usersInChat: string[] = getChatInfo(type).users.map(u => u._id)
    let _clients = clients.filter(c => _usersInChat.includes(c.auth?.userinfo?._id))
    return filter ? _clients.filter(filter) : _clients
}

export const allUsersEnterInChat = (type: IChat.Type, ...excludeClient: Socket[]): Promise<any> =>
    Promise.all(getClientsOnChat(type).filter(c => !excludeClient.includes(c)).map(client => enterInChat(client, type)))
           .then(results => {
               let dist = new Set(results)
               if(dist.size === 1) return { chatName: results[0] }
               throw new Error("More chats are selected .")
           })


export const enterInChat = (client: Socket, type: IChat.Type) => new Promise<any>((resolve, reject) => {
    client.emit("chat:enter", getChatInfo(type))
          .once(SocketEvent.CHAT_ENTER, ({chatName}) => resolve(chatName))
          .once(SocketEvent.CHAT_USER_NOT_FOUND, () => reject({event: SocketEvent.CHAT_USER_NOT_FOUND}))
          .once(SocketEvent.OPERATION_NOT_AUTHORIZED, () => reject({event: SocketEvent.OPERATION_NOT_AUTHORIZED}))
})

export const allUsersLeaveChat = (type: IChat.Type): Promise<void> => new Promise<void>(resolve => {
    getClientsOnChat(type).forEach(client => client.emit("chat:leave", getChatInfo(type)))
    resolve()
})

export const getExceptedChatName = (type: IChat.Type): string => {
    let _chat = getChatInfo(type)
    if(_chat) {
        switch(type){
            case IChat.Type.ONE: return [Rooms.CHAT_ONE, _chat.users.map(u => u._id).join('-')].join('-');
            case IChat.Type.GROUP: return  [Rooms.CHAT_GROUP, [_chat.info.name, _chat.users.map(u => u._id).join('-')].join('-') ].join('-')
        }
    }
}

export const getExceptedChatInfo = (type: IChat.Type): any => {
    let _chat = getChatInfo(type)
    if(_chat){
        return {
            _id: _chat._id,
            ..._chat.info
        }
    }
}

export const message = (sender: string): any => ({
    sender: { _id: sender },
    content: "examples message"
})

const randomInteger = (min: number, max: number): number => {
    max *= 1000; min *= 1000
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const readMessage = (sender: string, ...receivers: string[]): any => ({
    ...message(sender),
    read: receivers.map((r, index) => ({ user: { _id: r }, timestamp: Date.now() - (index < receivers.length - 1 ? randomInteger(1000, 5000): 0)  }))
})
