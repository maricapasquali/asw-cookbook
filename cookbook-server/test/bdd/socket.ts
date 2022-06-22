import {
    assert,
    expect
} from "chai"
import { Socket } from "socket.io-client"
import {
    connectDatabase,
    disconnectDatabase,
    dropDatabase,
    isTestingMode,
    TIMEOUT_DATABASE
} from "../helpers"
import {
    allUsersEnterInChat,
    allUsersLeaveChat,
    closeSockets,
    connectAllClients,
    connectClient,
    createNewClientFrom,
    disconnectAllClients,
    disconnectClient,
    enterInChat,
    filterOnlineClients,
    firedEvent,
    getChatInfo,
    getClient,
    getClientsOnChat,
    getExceptedChatInfo,
    getExceptedChatName,
    getUserIdentifierOfClient,
    getUserInfoOfClientInChat,
    insertSomeChats,
    insertSomeUsers,
    maxClients,
    message,
    readMessage,
    SocketEvent,
    startServer,
    subscribeEventOn,
    subscribeEventOnce
} from "../helpers/socket.helpers"
import { IChat } from "../../src/models/schemas/chat"

describe("Socket", function () {
    this.timeout(TIMEOUT_DATABASE)

    before(function () {
        if (isTestingMode)
            return connectDatabase().then(() => dropDatabase().then(() => insertSomeUsers().then(() => startServer())))
        else {
            console.log("[Before All]: All Tests ignored..")
            this.skip()
        }
    })

    after(() => {
        if (isTestingMode) {
            return dropDatabase()
                .then(() => {
                    console.debug("Drop database.")
                    return disconnectDatabase()
                        .then(() => {
                            console.debug("Disconnect database.")
                            return closeSockets()
                        })
                })
        } else {
            console.log("[After All]: All Tests ignored..")
        }
    })

    describe("1 - Connection", () => {
        it("client 0 (anonymous)", () => {
            const client = getClient(0)

            const promise1 = subscribeEventOnce(client, SocketEvent.USER_ONLINE, (...args) => {
                const arg1 = args[0]
                expect(arg1).undefined
            })
            const promise2 = subscribeEventOnce(client, SocketEvent.ALL_USERS_ONLINE, (...args) => {
                const arg1 = args[0]
                expect(arg1).all.members([])
            })

            client.connect()

            return Promise.all([promise1, promise2])
        })

        it("client 1 (signed)", () => {
            const numClient = 1
            const client = getClient(numClient)
            const user = getUserIdentifierOfClient(numClient)
            const promise1 = subscribeEventOnce(client, SocketEvent.USER_ONLINE, (...args) => {
                const arg1 = args[0]
                assert.equal(arg1, user)
            })
            const promise2 = subscribeEventOnce(client, SocketEvent.ALL_USERS_ONLINE, (...args) => {
                const arg1 = args[0]
                expect(arg1).all.members([user])
            })
            client.connect()
            return Promise.all([promise1, promise2])
        })

        it("client 2 (other signed)", () => {
            const numClient = 2
            const client = getClient(numClient)
            const user = getUserIdentifierOfClient(numClient)
            const otherUser = getUserIdentifierOfClient(numClient - 1)
            const promise1 = subscribeEventOnce(client, SocketEvent.USER_ONLINE, (...args) => {
                const arg1 = args[0]
                assert.equal(arg1, user)
            })
            const promise2 = subscribeEventOnce(client, SocketEvent.ALL_USERS_ONLINE, (...args) => {
                const arg1 = args[0]
                expect(arg1).all.members([user, otherUser])
            })
            client.connect()
            return Promise.all([promise1, promise2])
        })

        it("client 3 (other anonymous)", () => {
            const numClient = 3
            const client = getClient(numClient)
            const otherUser = getUserIdentifierOfClient(numClient - 1)
            const otherOtherUser = getUserIdentifierOfClient(numClient - 2)

            const promise1 = subscribeEventOnce(client, SocketEvent.USER_ONLINE, (...args) => {
                const arg1 = args[0]
                expect(arg1).undefined
            })
            const promise2 = subscribeEventOnce(client, SocketEvent.ALL_USERS_ONLINE, (...args) => {
                const arg1 = args[0]
                expect(arg1).all.members([otherUser, otherOtherUser])
            })
            client.connect()
            return Promise.all([promise1, promise2])
        })

        it("no client with invalid token", () => {
            const numClient = 4
            const client = getClient(numClient)
            client.connect()
            return subscribeEventOnce(client, SocketEvent.CONNECT_ERROR, error => {
                expect(error).be.instanceof(Error)
                expect(error.data).to.haveOwnProperty("expired")
                console.error("Error ", error.data)
            })
        })
    })

    describe("2 - Chat", () => {
        before(() => insertSomeChats().then(() => connectAllClients()))

        describe("Change role", () => {
            const typeChat = IChat.Type.ONE

            after(() => {
                return allUsersLeaveChat(typeChat)
            })

            beforeEach(() => {
                return enterInChat(getClient(2), typeChat)
            })

            function changeRole(role: string): Promise<void> {
                const numClient = 1
                const client = getClient(numClient)
                const user = getUserIdentifierOfClient(numClient)

                const chat = getChatInfo(typeChat)
                const _newRole = { user, role }

                const promise1 = subscribeEventOnce(client, SocketEvent.CHAT_CHANGE_ROLE_OK, (chatID, userRole) => {
                    expect(chatID).eq(chat._id)
                    expect(userRole).to.deep.eq(_newRole)
                })
                const promise2 = subscribeEventOnce(client, SocketEvent.OPERATION_NOT_AUTHORIZED, () => assert.fail(firedEvent(SocketEvent.OPERATION_NOT_AUTHORIZED)))
                const promise3 = subscribeEventOnce(client, SocketEvent.CHAT_UNCHANGED_ROLE, () => assert.fail(firedEvent(SocketEvent.CHAT_UNCHANGED_ROLE)))

                client.emit("chat:change:role", chat._id, _newRole)

                return Promise.race([promise1, promise2, promise3])
            }

            it("1) from 'writer' to 'reader' (delete chat)", () => {
                return changeRole("reader")
            })

            it("2) from 'reader' to 'writer' (restore chat)", () => {
                return changeRole("writer")
            })

            it.skip("in a GROUP", () => {
                assert.fail("Not implemented yet")
            })
        })

        describe("Enter", () => {
            it("no anonymous user", () => {
                const client = getClient(0)

                const promise1 = subscribeEventOnce(client, SocketEvent.CHAT_ENTER, () => assert.fail(firedEvent(SocketEvent.CHAT_ENTER) + "Anonymous user MUST NOT ENTER in a chat"))
                const promise2 = subscribeEventOnce(client, SocketEvent.CHAT_USER_NOT_FOUND, () => assert.fail(firedEvent(SocketEvent.CHAT_USER_NOT_FOUND)))
                const promise3 = subscribeEventOnce(client, SocketEvent.OPERATION_NOT_AUTHORIZED, () => assert.ok("operation not authorized"))

                client.emit("chat:enter", getChatInfo(IChat.Type.ONE))

                return Promise.race([promise1, promise2, promise3])
            })

            it("no signed user with INVALID token", () => {
                const client = createNewClientFrom(2, "1 milliseconds")

                const promise1 = subscribeEventOnce(client, SocketEvent.CHAT_ENTER, () => assert.fail(firedEvent(SocketEvent.CHAT_ENTER) + "Signed user (with invalid token) MUST NOT ENTER"))
                const promise2 = subscribeEventOnce(client, SocketEvent.CHAT_USER_NOT_FOUND, () => assert.fail(firedEvent(SocketEvent.CHAT_USER_NOT_FOUND)))
                const promise3 = subscribeEventOnce(client, SocketEvent.CONNECT_ERROR, () => {
                    expect(client.disconnected).true
                    expect(client.connected).false
                })

                client.connect().emit("chat:enter", getChatInfo(IChat.Type.ONE))

                return Promise.race([promise1, promise2, promise3]).catch(() => disconnectClient(client))
            })

            it("no signed user with VALID token not present", () => {
                const numClient = 5
                const client = getClient(numClient)
                const _IdUser = getUserIdentifierOfClient(numClient)

                const promise1 = subscribeEventOnce(client, SocketEvent.CHAT_ENTER, () => assert.fail(firedEvent(SocketEvent.CHAT_ENTER) + "Signed user MUST NOT ENTER in a chat in which he is not present"))
                const promise2 = subscribeEventOnce(client, SocketEvent.CHAT_USER_NOT_FOUND, user => expect(user)
                    .eq(_IdUser))
                const promise3 = subscribeEventOnce(client, SocketEvent.OPERATION_NOT_AUTHORIZED, () => assert.fail(firedEvent(SocketEvent.OPERATION_NOT_AUTHORIZED)))

                client.emit("chat:enter", getChatInfo(IChat.Type.ONE))

                return Promise.race([promise1, promise2, promise3])
            })

            it("signed user with valid token", () => {
                const typeChat = IChat.Type.ONE
                const numClient = 1
                const client = getClient(numClient)
                const user = getUserIdentifierOfClient(numClient)

                const promise1 = subscribeEventOnce(client, SocketEvent.CHAT_ENTER, ({ chatName, enteredUser }) => {
                    expect(chatName)
                        .eq(getExceptedChatName(typeChat))
                    expect(enteredUser)
                        .eq(user)
                })
                const promise2 = subscribeEventOnce(client, SocketEvent.CHAT_USER_NOT_FOUND, () => assert.fail(firedEvent(SocketEvent.CHAT_USER_NOT_FOUND)))
                const promise3 = subscribeEventOnce(client, SocketEvent.OPERATION_NOT_AUTHORIZED, () => assert.fail(firedEvent(SocketEvent.OPERATION_NOT_AUTHORIZED)))

                client.emit("chat:enter", getChatInfo(typeChat))

                return Promise.race([promise1, promise2, promise3])
            })
        })

        describe("Leave", () => {
            it("no signed user with valid token in which he is not enter", () => {
                const numClient = 2
                const client = getClient(numClient)
                const user = getUserIdentifierOfClient(numClient)

                const promise1 = subscribeEventOnce(client, SocketEvent.CHAT_LEAVE, () => assert.fail(firedEvent(SocketEvent.CHAT_LEAVE) + "Signed user MUST NOT LEAVE a chat in which he is not enter"))
                const promise2 = subscribeEventOnce(client, SocketEvent.CHAT_USER_NOT_ENTERED, leavedUser => {
                    expect(leavedUser).eq(user)
                })
                client.emit("chat:leave", getChatInfo(IChat.Type.ONE))

                return Promise.race([promise1, promise2])
            })

            it("signed user with valid token (GROUP) async", () => {
                const typeChat = IChat.Type.GROUP
                return allUsersEnterInChat(typeChat)
                    .then(() => {
                        const _pos1 = 1
                        const _pos2 = 2
                        const client1 = getClient(_pos1)
                        const client2 = getClient(_pos2)
                        const user1 = getUserIdentifierOfClient(_pos1)
                        const user2 = getUserIdentifierOfClient(_pos2)

                        function leaveChatGroup(client, _leavedUsers = []): Promise<any> {
                            const othersUsersInChats = getClientsOnChat(typeChat, c => c !== client && !Array.from(_leavedUsers).includes(getUserInfoOfClientInChat(c, typeChat)?._id))

                            const promises = othersUsersInChats.map(cl =>
                                new Promise((resolve, reject) => {
                                    const userinfo = getUserInfoOfClientInChat(client, typeChat)
                                    subscribeEventOn(cl, SocketEvent.CHAT_LEAVE, ({ chatName, enteredUser }) => {
                                        expect(chatName).eq(getExceptedChatName(typeChat))
                                        expect(enteredUser).oneOf([user1, user2])
                                        const callerUserInfo = getUserInfoOfClientInChat(cl, typeChat)
                                        console.debug("I am client " + callerUserInfo.userID + " on leave : " + enteredUser, ", otherClients ", othersUsersInChats.length)
                                        resolve(enteredUser)
                                    }, ({ enteredUser }) => enteredUser === userinfo._id)
                                        .catch(reject)
                                })
                            )

                            const promisesAll = othersUsersInChats.length
                                ? Promise.all(promises)
                                    .then(results => {
                                        console.debug("(Leaver): I am client " + getUserInfoOfClientInChat(client, typeChat).userID, " => Results = ", results)
                                        return Array.from(new Set(results))
                                    })
                                : Promise.resolve(["Notified to anyone"])

                            const promiseErr = subscribeEventOnce(client, SocketEvent.CHAT_USER_NOT_ENTERED, () => assert.fail(firedEvent(SocketEvent.CHAT_USER_NOT_ENTERED)))

                            client.emit("chat:leave", getChatInfo(typeChat))

                            return Promise.race([promisesAll, promiseErr])
                        }

                        return leaveChatGroup(client1)
                            .then(_leavedUsers => leaveChatGroup(client2, _leavedUsers).then(users => [..._leavedUsers, ...users]))
                            .then(_leavedUsers => expect(_leavedUsers).all.members([user1, user2]))
                    })
            })

            it("signed user with valid token (ONE TO ONE)", () => {
                const typeChat = IChat.Type.ONE
                return allUsersEnterInChat(typeChat)
                    .then(() => {
                        const numClient = 1
                        const client = getClient(numClient)
                        const user = getUserIdentifierOfClient(numClient)
                        const othersUsersInChats = getClientsOnChat(typeChat, c => c !== client)

                        const promise1 = subscribeEventOnce(client, SocketEvent.CHAT_USER_NOT_ENTERED, () => assert.fail(firedEvent(SocketEvent.CHAT_USER_NOT_ENTERED)))
                        const promise2 = othersUsersInChats.length === 1
                            ? subscribeEventOnce(othersUsersInChats[0], SocketEvent.CHAT_LEAVE, ({ enteredUser }) => expect(enteredUser).eq(user))
                            : othersUsersInChats.length === 0
                                ? Promise.resolve("Notified to anyone")
                                : Promise.reject(assert.fail("No Chat One to One"))

                        client.emit("chat:leave", getChatInfo(typeChat))

                        return Promise.race([promise1, promise2])
                    })
            })
        })

        describe("Read message/s", () => {
            let copyClient2

            before(() => {
                copyClient2 = createNewClientFrom(2)
                return connectClient(copyClient2)
            })
            after(() => Promise.all([
                disconnectClient(copyClient2),
                allUsersLeaveChat(IChat.Type.ONE),
                allUsersLeaveChat(IChat.Type.GROUP)
            ]))

            it("no signed user with valid token in which he is not enter", () => {
                const typeChat = IChat.Type.GROUP
                const numClient = 2
                const client = getClient(numClient)
                return allUsersEnterInChat(typeChat, client)
                    .then(({ chatName }) => {
                        const reader = getUserIdentifierOfClient(numClient)

                        const otherUser = getClientsOnChat(typeChat, c => c !== client)[0]

                        const sender = getUserIdentifierOfClient(1)

                        const msg = readMessage(sender, reader)

                        const errMex = "Signed user MUST NOT READ messages in a chat in which he is not enter"
                        const promise1 = subscribeEventOnce(otherUser, SocketEvent.CHAT_READ_MESSAGES, () => assert.fail(firedEvent(SocketEvent.CHAT_READ_MESSAGES) + errMex))
                        const promise2 = subscribeEventOnce(otherUser, SocketEvent.OPERATION_NOT_AUTHORIZED, () => assert.fail(firedEvent(SocketEvent.OPERATION_NOT_AUTHORIZED)))
                        const promise3 = subscribeEventOnce(client, SocketEvent.CHAT_USER_NOT_ENTERED, enteredUser => expect(enteredUser).eq(reader))

                        client.emit("chat:read", chatName, [msg])

                        return Promise.race([promise1, promise2, promise3])
                    })
            })

            it("from user who has two open connections (one in chat and other no)", () => {
                const typeChat = IChat.Type.ONE
                return allUsersEnterInChat(typeChat)
                    .then(({ chatName }) => {
                        const pos2 = 2
                        const client2 = getClient(pos2)

                        const user1 = getUserIdentifierOfClient(1)
                        const user2 = getUserIdentifierOfClient(pos2)

                        const msg = readMessage(user1, user2)

                        const promise1 = subscribeEventOnce(client2, SocketEvent.OPERATION_NOT_AUTHORIZED, () => assert.fail(firedEvent(SocketEvent.OPERATION_NOT_AUTHORIZED)))
                        const promise2 = subscribeEventOnce(client2, SocketEvent.CHAT_USER_NOT_ENTERED, () => assert.fail(firedEvent(SocketEvent.CHAT_USER_NOT_ENTERED)))
                        const promise3 = subscribeEventOnce(copyClient2, SocketEvent.CHAT_READ_MESSAGES, args => {
                            const info = args[0]?.info
                            const messages = args[0]?.messages

                            expect(messages[0]).to.deep.eq(msg)

                            const expInfoChat = getExceptedChatInfo(typeChat)

                            expect(info.name).undefined
                            expect(info.name).eq(expInfoChat.name)
                            expect(info.type).eq(expInfoChat.type)
                            expect(info._id).eq(expInfoChat._id)
                            expect(info.usersRole).to.deep.eq(expInfoChat.usersRole)
                        })

                        client2.emit("chat:read", chatName, [msg])

                        return Promise.race([promise1, promise2, promise3])
                    })
            })

            it("from user in ONE to ONE chat.", () => {
                const typeChat = IChat.Type.ONE
                return allUsersEnterInChat(typeChat)
                    .then(({ chatName }) => {
                        const pos1 = 1
                        const pos2 = 2

                        const client1 = getClient(pos1)
                        const client2 = getClient(pos2)

                        const user1 = getUserIdentifierOfClient(pos1)
                        const user2 = getUserIdentifierOfClient(pos2)

                        const msg = readMessage(user1, user2)

                        const promise1 = subscribeEventOnce(client2, SocketEvent.OPERATION_NOT_AUTHORIZED, () => assert.fail(firedEvent(SocketEvent.OPERATION_NOT_AUTHORIZED)))
                        const promise2 = subscribeEventOnce(client2, SocketEvent.CHAT_USER_NOT_ENTERED, () => assert.fail(firedEvent(SocketEvent.CHAT_USER_NOT_ENTERED)))
                        const promise3 = subscribeEventOnce(client1, SocketEvent.CHAT_READ_MESSAGES, messages => expect(messages[0]).to.deep.eq(msg))

                        client2.emit("chat:read", chatName, [msg])

                        return Promise.race([promise1, promise2, promise3])
                    })
            })

            it("from user in GROUP chat.", () => {
                const typeChat = IChat.Type.GROUP
                return allUsersEnterInChat(typeChat)
                    .then(({ chatName }) => {
                        const pos5 = 5
                        const client5 = getClient(pos5)
                        const user5 = getUserIdentifierOfClient(pos5) // who read
                        const user2 = getUserIdentifierOfClient(2) // who read

                        const user1 = getUserIdentifierOfClient(1) // sender

                        const msg = readMessage(user1, user2, user5)

                        const promise1 = subscribeEventOnce(client5, SocketEvent.OPERATION_NOT_AUTHORIZED, () => assert.fail(firedEvent(SocketEvent.OPERATION_NOT_AUTHORIZED)))
                        const promise2 = subscribeEventOnce(client5, SocketEvent.CHAT_USER_NOT_ENTERED, () => assert.fail(firedEvent(SocketEvent.CHAT_USER_NOT_ENTERED)))

                        const promise3 = Promise.all(
                            getClientsOnChat(typeChat, c => c !== client5)
                                .map(c => subscribeEventOnce(c, SocketEvent.CHAT_READ_MESSAGES, messages => {
                                    const mex = messages[0]
                                    expect(mex).to.deep.eq(msg)
                                    expect(mex.sender?._id).eq(user1)
                                    expect(mex.read.map(r => r.user._id)).to.have.all.members([user2, user5])
                                }))
                        )

                        client5.emit("chat:read", chatName, [msg])

                        return Promise.race([promise1, promise2, promise3])
                    })
            })
        })

        describe("Send message", () => {
            it("no signed user with valid token in which he is not enter", () => {
                const typeChat = IChat.Type.ONE

                const numClient = 1
                const client = getClient(numClient)
                const user = getUserIdentifierOfClient(numClient)

                const otherUser = getClientsOnChat(typeChat, c => c !== client)[0]

                function blockSendMessage(cc: Socket, chatName: string): Promise<void> {
                    const errMex = "Signed user MUST NOT SEND MESSAGES in a chat in which he is not enter"
                    const promise1 = subscribeEventOnce(otherUser, SocketEvent.CHAT_PUSH_MESSAGES, () => assert.fail(firedEvent(SocketEvent.CHAT_PUSH_MESSAGES) + errMex))
                    const promise2 = subscribeEventOnce(otherUser, SocketEvent.CHAT_MESSAGES, () => assert.fail(firedEvent(SocketEvent.CHAT_MESSAGES) + errMex))
                    const promise3 = subscribeEventOnce(cc, SocketEvent.CHAT_USER_NOT_ENTERED, enteredUser => expect(enteredUser).eq(user))

                    cc.emit("chat:messages", chatName, message(user))

                    return Promise.race([promise1, promise2, promise3])
                }

                return Promise.all([
                    enterInChat(otherUser, typeChat).then(chatName => blockSendMessage(client, chatName)),
                    blockSendMessage(client, getExceptedChatName(typeChat))
                ])
            })

            it("to user in ONE to ONE chat.", () => {
                const typeChat = IChat.Type.ONE

                return allUsersEnterInChat(typeChat)
                    .then(({ chatName }) => {
                        const numClient = 2
                        const client = getClient(numClient)
                        const user = getUserIdentifierOfClient(numClient)

                        const othersUsersInChats = getClientsOnChat(typeChat, c => c !== client)

                        const msg = message(user)

                        const promise1 = subscribeEventOnce(othersUsersInChats[0], SocketEvent.CHAT_MESSAGES, messages => expect(messages[0]).to.deep.eq(msg))
                        const promise2 = subscribeEventOnce(client, SocketEvent.OPERATION_NOT_AUTHORIZED, () => assert.fail(firedEvent(SocketEvent.OPERATION_NOT_AUTHORIZED)))

                        client.emit("chat:messages", chatName, msg)

                        return Promise.race([promise1, promise2])
                    })
            })

            it("to user that it is not in chat right now.", () => {
                const typeChat = IChat.Type.ONE

                const numClient = 1
                const client = getClient(numClient)
                const user = getUserIdentifierOfClient(numClient)

                return enterInChat(client, typeChat)
                    .then(chatName => {
                        const msg = message(user)

                        const otherUser = getClientsOnChat(typeChat, c => c !== client)[0]

                        const promise1 = subscribeEventOnce(otherUser, SocketEvent.CHAT_PUSH_MESSAGES, args => {
                            const info = args[0]?.info
                            const messages = args[0]?.messages

                            expect(messages[0]).to.deep.eq(msg)

                            const expInfoChat = getExceptedChatInfo(typeChat)

                            expect(info.name).undefined
                            expect(info.name).eq(expInfoChat.name)
                            expect(info.type).eq(expInfoChat.type)
                            expect(info._id).eq(expInfoChat._id)
                            expect(info.usersRole).to.deep.eq(expInfoChat.usersRole)
                        })
                        const promise2 = subscribeEventOnce(client, SocketEvent.OPERATION_NOT_AUTHORIZED, () => assert.fail(firedEvent(SocketEvent.OPERATION_NOT_AUTHORIZED)))

                        client.emit("chat:messages", chatName, msg)

                        return Promise.race([promise1, promise2])
                    })
            })

            it("to users in GROUP chat", () => {
                const _pos1 = 1
                const _pos2 = 2
                const client1 = getClient(_pos1)
                const client2 = getClient(_pos2)
                const user2 = getUserIdentifierOfClient(_pos2)

                const typeChat = IChat.Type.GROUP

                return Promise.all([enterInChat(client1, typeChat), enterInChat(client2, typeChat)])
                    .then(results => {
                        const chatName = results[0]

                        const _pos5 = 5
                        const client5 = getClient(_pos5)

                        function sendMessagesInChatGroup(client: Socket, message: any): Promise<[void, void]> {
                            const otherClients = getClientsOnChat(typeChat, c => c !== client)

                            if (otherClients.length <= 0) return Promise.reject(assert.fail("No other users in chat."))
                            else {
                                const promise1 = subscribeEventOn(client5, SocketEvent.CHAT_PUSH_MESSAGES, messages => {
                                    const _message = messages[0]
                                    const callerUserInfo = getUserInfoOfClientInChat(client5, typeChat)
                                    console.debug("I am client " + callerUserInfo.userID + " on sending messages : " + JSON.stringify(_message.info))

                                    const expInfoChat = getExceptedChatInfo(typeChat)

                                    expect(_message.info.name).eq(expInfoChat.name)
                                    expect(_message.info.type).eq(expInfoChat.type)
                                    expect(_message.info._id).eq(expInfoChat._id)
                                    expect(_message.info.usersRole).to.deep.eq(expInfoChat.usersRole)

                                    expect(_message.messages).to.deep.eq([message])
                                })

                                const promise2 = subscribeEventOn(client1, SocketEvent.CHAT_MESSAGES, messages => {
                                    const _message = messages[0]
                                    const callerUserInfo = getUserInfoOfClientInChat(client1, typeChat)
                                    console.debug("I am client " + callerUserInfo.userID + " on sending messages : " + JSON.stringify(_message))
                                    expect(_message.sender).to.deep.eq(message.sender)
                                    expect(_message.content).to.deep.eq(message.content)
                                })

                                client.emit("chat:messages", chatName, message)

                                return Promise.all([promise1, promise2])
                            }
                        }

                        const operationNotAuthPromise = subscribeEventOnce(client2, SocketEvent.OPERATION_NOT_AUTHORIZED, () => assert.fail(firedEvent(SocketEvent.OPERATION_NOT_AUTHORIZED)))
                        const userNotEnteredPromise = subscribeEventOnce(client2, SocketEvent.CHAT_USER_NOT_ENTERED, () => assert.fail(firedEvent(SocketEvent.CHAT_USER_NOT_ENTERED)))
                        const sendMessagesInChatGroupPromise = sendMessagesInChatGroup(client2, message(user2))

                        return Promise.race([sendMessagesInChatGroupPromise, userNotEnteredPromise, operationNotAuthPromise])
                    })
            })
        })

        describe("Typing", () => {
            beforeEach(() => {
                return allUsersLeaveChat(IChat.Type.ONE)
            })

            it("no signed user with valid token in which he is not enter", () => {
                const typeChat = IChat.Type.ONE

                const numClient = 2
                const client = getClient(numClient)
                const user = getUserIdentifierOfClient(numClient)
                const userInfo = getUserInfoOfClientInChat(client, typeChat)

                const otherUser = getClientsOnChat(typeChat, c => c !== client)[0]

                const chatName = getExceptedChatName(typeChat)

                const errMex = "Signed user MUST NOT TYPING in a chat in which he is not enter"
                const promise1 = subscribeEventOnce(otherUser, SocketEvent.CHAT_TYPING, () => assert.fail(firedEvent(SocketEvent.CHAT_TYPING) + errMex))
                const promise2 = subscribeEventOnce(otherUser, SocketEvent.OPERATION_NOT_AUTHORIZED, () => assert.fail(firedEvent(SocketEvent.OPERATION_NOT_AUTHORIZED)))
                const promise3 = subscribeEventOnce(client, SocketEvent.CHAT_USER_NOT_ENTERED, enteredUser => expect(enteredUser).eq(user))

                client.emit("chat:typing", chatName, { _id: userInfo._id, userID: userInfo.userID, typing: true })
                return Promise.race([promise1, promise2, promise3])
            })

            it("of one user (ONE TO ONE)", () => {
                const typeChat = IChat.Type.ONE
                return allUsersEnterInChat(typeChat)
                    .then(({ chatName }) => {
                        const numClient = 1
                        const client = getClient(numClient)
                        const user = getUserIdentifierOfClient(numClient)
                        const userInfo = getUserInfoOfClientInChat(client, typeChat)
                        const othersUsersInChats = getClientsOnChat(typeChat, c => c !== client)

                        const promise1 = subscribeEventOnce(client, SocketEvent.OPERATION_NOT_AUTHORIZED, () => assert.fail(firedEvent(SocketEvent.OPERATION_NOT_AUTHORIZED)))
                        const promise2 = othersUsersInChats.length === 1
                            ? subscribeEventOnce(othersUsersInChats[0], SocketEvent.CHAT_TYPING, data => {
                                const callerUserInfo = getUserInfoOfClientInChat(othersUsersInChats[0], typeChat)
                                console.debug("I am client " + callerUserInfo.userID + " on typing : " + JSON.stringify(data))
                                expect(data._id).eq(user)
                                expect(data.typing).true
                            })
                            : Promise.reject(assert.fail(othersUsersInChats.length === 0 ? "No other users in chat." : "No Chat One to One"))

                        client.emit("chat:typing", chatName, { _id: userInfo._id, userID: userInfo.userID, typing: true })

                        return Promise.race([promise1, promise2])
                    })
            })

            it("of more users (GROUP)", () => {
                const typeChat = IChat.Type.GROUP
                return allUsersEnterInChat(typeChat)
                    .then(({ chatName }) => {
                        const _pos1 = 1
                        const _pos2 = 2
                        const _pos5 = 5

                        const client1 = getClient(_pos1)
                        const client2 = getClient(_pos2)
                        const client5 = getClient(_pos5)

                        const user1 = getUserIdentifierOfClient(_pos1)
                        const user2 = getUserIdentifierOfClient(_pos2)
                        const user5 = getUserIdentifierOfClient(_pos5)

                        function operationNotAuth(client: Socket): Promise<void> {
                            return subscribeEventOnce(client, SocketEvent.OPERATION_NOT_AUTHORIZED, () => assert.fail(firedEvent(SocketEvent.OPERATION_NOT_AUTHORIZED)))
                        }

                        function typingInChatGroup(client: Socket, typing: boolean): Promise<{_id: string, typing: boolean}> {
                            return new Promise((resolve, reject) => {
                                const userinfo = getUserInfoOfClientInChat(client, typeChat)
                                const otherClients = getClientsOnChat(typeChat, c => c !== client)

                                if (otherClients.length) {
                                    let _events = 0
                                    otherClients.forEach(cl => {
                                        subscribeEventOn(cl, SocketEvent.CHAT_TYPING, data => {
                                            const callerUserInfo = getUserInfoOfClientInChat(cl, typeChat)
                                            console.debug("I am client " + callerUserInfo.userID + " on typing : " + JSON.stringify(data))
                                            expect(data._id).eq(userinfo._id)
                                            expect(data.typing).eq(typing)
                                            _events += 1
                                            console.debug("otherClients ", otherClients.length, ", _events ", _events, " => RESOLVE ", _events === otherClients.length)
                                            if (_events === otherClients.length) resolve(data)
                                        },
                                        data => userinfo._id === data._id)
                                            .catch(reject)
                                    })
                                } else assert.fail("No other users in chat.")

                                client.emit("chat:typing", chatName, { _id: userinfo._id, userID: userinfo.userID, typing })
                            })
                        }

                        const promises1 = Promise.all([
                            typingInChatGroup(client1, false),
                            typingInChatGroup(client2, true),
                            typingInChatGroup(client5, true)
                        ])
                            .then(results => {
                                expect(results.map(t => t._id)).all.members([user1, user2, user5])
                                expect(results.map(t => t.typing)).all.members([false, true, true])
                            })
                        const promises2 = Promise.race([operationNotAuth(client1), operationNotAuth(client2), operationNotAuth(client5)])

                        return Promise.race([promises1, promises2])
                    })
            })
        })
    })

    describe("3 - Disconnection", () => {
        before(disconnectAllClients)

        beforeEach(connectAllClients)

        it("of a signed user", () => {
            const numClient = 1
            const client = getClient(numClient)
            const user = getUserIdentifierOfClient(numClient)

            client.disconnect()

            const othersClients = filterOnlineClients(client)
            expect(othersClients).to.lengthOf(maxClients() - 1)

            return Promise.all(
                othersClients.map(cl => subscribeEventOn(cl, SocketEvent.USER_OFFLINE, (id, date) => {
                    expect(id).eq(user)
                    expect(date).approximately(Date.now(), 10000)
                }))
            )
        })

        it("of an anonymous user", () => {
            const client = getClient(3)

            client.disconnect()

            const othersClients = filterOnlineClients(client)
            expect(othersClients).to.lengthOf(maxClients() - 1)

            return Promise.all(
                othersClients.map(cl => subscribeEventOn(cl, SocketEvent.USER_OFFLINE, (id, date) => {
                    expect(id).undefined
                    expect(date).undefined
                }))
            )
        })
    })
})
