export type ChatRoomUser = { _id: string | null, userID: string | "Anonymous", isAdmin?: boolean }
type ChatExtraInfo = { _id: string, name?: string, type: string, usersRole: any[] }
type Chat = { name: string, availableUsers: ChatRoomUser[], extra: ChatExtraInfo }

const openedChats: Chat[] = []

export function pushInOpenedChat(chatName: string, availableUsers: ChatRoomUser[], extrasInfo: ChatExtraInfo) {
    const _chat = { name: chatName, availableUsers, extra: extrasInfo }
    const opened = !!openedChats.find(c => c.name === chatName)
    console.debug("Chat ", JSON.stringify(_chat), " is open = ", opened)
    if (!opened) openedChats.push(_chat)
}

export function findUsersInOpenedChat(chatName: string, senders: string[]): {users?: string[], chatInfo?: any} {
    const chat = openedChats.find(chat => chat.name === chatName)
    return chat
        ? {
            users: chat.extra.usersRole.map(u => u.user)
                .filter(u => !senders.includes(u)),
            chatInfo: chat.extra
        }
        : {}
}

export function changeUserRoleInChat(id: string, userRole: { role: string, user: string }): boolean {
    const openChat = openedChats.find(chat => chat.extra._id === id)
    if (openChat) {
        const index = openChat.extra.usersRole.findIndex(r => r.user === userRole.user)
        if (index !== -1) {
            openChat.extra.usersRole.splice(index, 1, userRole)
            console.debug(`chat ${id} => new users role = `, openChat.extra.usersRole)
            return true
        }
    }
    return false
}

export function popFromOpenedChat(io: any, chatName: string) {
    const roomSockets = io.sockets.adapter.rooms.get(chatName)
    console.debug("Room sockets = ", roomSockets)
    if (!roomSockets) {
        const index = openedChats.findIndex(chat => chat.name == chatName)
        if (index !== -1) {
            console.debug("remove opened chat ", chatName)
            openedChats.splice(index, 1)
        }
    }
    console.debug("Opened chats ", openedChats)
}

export function isInChat(chatName: string, io: any, socketId: any): boolean {
    return !!io.sockets.adapter.rooms.get(chatName)
        ?.has(socketId)
}

export function openedChatsRoom(io: any): string[] {
    return Array.from(io.sockets.adapter.rooms.keys())
        .map(k => k.toString())
        .filter(k => k.search("chat-") !== -1)
}
