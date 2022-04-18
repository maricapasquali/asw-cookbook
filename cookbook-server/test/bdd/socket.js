const assert = require("assert");
const {expect} = require("chai");
const should = require("chai").should();
const {
    TIMEOUT_DATABASE,
    isTestingMode,
    connectDatabase,
    dropDatabase,
    disconnectDatabase
} = require("../helpers");
const {
    SocketEvent,
    insertSomeUsers,
    startServer,
    closeSockets,
    getClient,
    getUserIdentifierOfClient,
    connectAllClients,
    filterOnlineClients,
    disconnectAllClients,
    subscribeEventOnce,
    insertSomeChats,
    getExceptedChatName,
    allUsersEnterInChat,
    getChatInfo,
    getClientsOnChat,
    getUserInfoOfClientInChat,
    subscribeEventOn,
    enterInChat,
    allUsersLeaveChat,
    maxClients,
    getExceptedChatInfo,
    message,
    readMessage,
    createNewClientFrom,
    connectClient,
    disconnectClient,
    firedEvent
} = require("../helpers/socket.helpers");
const {IChat} = require("../../models/schemas/chat");

describe("Socket", function() {

    this.timeout(TIMEOUT_DATABASE)

    before(function (){
        if(isTestingMode) return connectDatabase().then(() => dropDatabase().then(()=>insertSomeUsers().then(() => startServer())))
        else {
            console.log("[Before All]: All Tests ignored..")
            this.skip()
        }
    })

    after(function() {
        if(isTestingMode) {
            return dropDatabase()
                    .then(() => {
                        console.debug("Drop database.")
                        return disconnectDatabase()
                                .then(() => {
                                    console.debug("Disconnect database.")
                                    return closeSockets()
                                })
                    })
        }
        else {
            console.log("[After All]: All Tests ignored..")
        }
    })

    describe("1 - Connection", function(){

        it("client 0 (anonymous)", function() {
            let client = getClient(0)

            let promise1 = subscribeEventOnce(client, SocketEvent.USER_ONLINE, (...args) => {
                let arg1 = args[0]
                expect(arg1).undefined
            })
            let promise2 = subscribeEventOnce(client, SocketEvent.ALL_USERS_ONLINE, (...args) => {
                let arg1 = args[0]
                expect(arg1).all.members([])
            })

            client.connect()

            return Promise.all([promise1, promise2])
        })

        it("client 1 (signed)", function() {
            let numClient = 1
            let client = getClient(numClient)
            let user = getUserIdentifierOfClient(numClient)
            let promise1 = subscribeEventOnce(client, SocketEvent.USER_ONLINE, (...args) => {
                let arg1 = args[0]
                assert.equal(arg1, user)
            })
            let promise2 = subscribeEventOnce(client, SocketEvent.ALL_USERS_ONLINE, (...args) => {
                let arg1 = args[0]
                expect(arg1).all.members([user])
            })
            client.connect()
            return Promise.all([promise1, promise2])
        })

        it("client 2 (other signed)", function() {
            let numClient = 2
            let client = getClient(numClient)
            let user = getUserIdentifierOfClient(numClient)
            let otherUser = getUserIdentifierOfClient(numClient-1)
            let promise1 = subscribeEventOnce(client, SocketEvent.USER_ONLINE, (...args) => {
                let arg1 = args[0]
                assert.equal(arg1, user)
            })
            let promise2 = subscribeEventOnce(client, SocketEvent.ALL_USERS_ONLINE, (...args) => {
                let arg1 = args[0]
                expect(arg1).all.members([user, otherUser])
            })
            client.connect()
            return Promise.all([promise1, promise2])
        })

        it("client 3 (other anonymous)", function() {
            let numClient = 3
            let client = getClient(numClient)
            let otherUser = getUserIdentifierOfClient(numClient-1)
            let otherOtherUser = getUserIdentifierOfClient(numClient-2)

            let promise1 = subscribeEventOnce(client, SocketEvent.USER_ONLINE, (...args) => {
                let arg1 = args[0]
                expect(arg1).undefined
            })
            let promise2 = subscribeEventOnce(client, SocketEvent.ALL_USERS_ONLINE, (...args) => {
                let arg1 = args[0]
                expect(arg1).all.members([otherUser, otherOtherUser])
            })
            client.connect()
            return Promise.all([promise1, promise2])
        })

        it("no client with invalid token", function() {
            let numClient = 4
            let client = getClient(numClient)
            client.connect()
            return subscribeEventOnce(client, SocketEvent.CONNECT_ERROR, (error) => {
                expect(error).be.instanceof(Error)
                expect(error.data).to.haveOwnProperty("expired")
                console.error("Error ", error.data)
            })
        })
    })

    describe("2 - Chat", function (){

        before(() => insertSomeChats().then(() => connectAllClients()))

        describe("Change role", function (){
            let typeChat = IChat.Type.ONE

            after(() => {
                return allUsersLeaveChat(typeChat)
            })

            beforeEach(() => {
                return enterInChat(getClient(2), typeChat)
            })

            const changeRole = function (role){
                let numClient = 1
                let client = getClient(numClient)
                let user = getUserIdentifierOfClient(numClient)

                let chat = getChatInfo(typeChat)
                let _newRole = {user, role}

                let promise1 = subscribeEventOnce(client, SocketEvent.CHAT_CHANGE_ROLE_OK, (chatID, userRole) => {
                    expect(chatID).eq(chat._id)
                    expect(userRole).to.deep.eq(_newRole)
                })
                let promise2 = subscribeEventOnce(client, SocketEvent.OPERATION_NOT_AUTHORIZED, () => assert.fail(firedEvent(SocketEvent.OPERATION_NOT_AUTHORIZED)))
                let promise3 = subscribeEventOnce(client, SocketEvent.CHAT_UNCHANGED_ROLE, () => assert.fail(firedEvent(SocketEvent.CHAT_UNCHANGED_ROLE)))

                client.emit("chat:change:role", chat._id, _newRole)

                return Promise.race([promise1, promise2, promise3])
            }

            it("1) from 'writer' to 'reader' (delete chat)", function (){
                return changeRole("reader")
            })

            it("2) from 'reader' to 'writer' (restore chat)", function (){
                return changeRole("writer")
            })

            it.skip("in a GROUP", function (){
                assert.fail("Not implemented yet")
            })
        })

        describe("Enter", function (){

            it("no anonymous user", function (){
                let client = getClient(0)

                let promise1 = subscribeEventOnce(client, SocketEvent.CHAT_ENTER, () => assert.fail(firedEvent(SocketEvent.CHAT_ENTER) + "Anonymous user MUST NOT ENTER in a chat"))
                let promise2 = subscribeEventOnce(client, SocketEvent.CHAT_USER_NOT_FOUND, () => assert.fail(firedEvent(SocketEvent.CHAT_USER_NOT_FOUND)))
                let promise3 = subscribeEventOnce(client, SocketEvent.OPERATION_NOT_AUTHORIZED, () => assert.ok("operation not authorized"))

                client.emit("chat:enter", getChatInfo(IChat.Type.ONE))

                return Promise.race([promise1, promise2, promise3])
            })

            it("no signed user with INVALID token", function (){
                let client = createNewClientFrom(2, "1 milliseconds")

                let promise1 = subscribeEventOnce(client, SocketEvent.CHAT_ENTER, () => assert.fail(firedEvent(SocketEvent.CHAT_ENTER) + "Signed user (with invalid token) MUST NOT ENTER"))
                let promise2 = subscribeEventOnce(client, SocketEvent.CHAT_USER_NOT_FOUND, () => assert.fail(firedEvent(SocketEvent.CHAT_USER_NOT_FOUND)))
                let promise3 = subscribeEventOnce(client, SocketEvent.CONNECT_ERROR, () => {
                    expect(client.disconnected).true
                    expect(client.connected).false
                })

                client.connect().emit("chat:enter", getChatInfo(IChat.Type.ONE))

                return Promise.race([promise1, promise2, promise3]).catch(() => disconnectClient(client))
            })

            it("no signed user with VALID token not present", function (){
                let numClient = 5
                let client = getClient(numClient)
                let _IdUser = getUserIdentifierOfClient(numClient)

                let promise1 = subscribeEventOnce(client, SocketEvent.CHAT_ENTER, () => assert.fail(firedEvent(SocketEvent.CHAT_ENTER) +  "Signed user MUST NOT ENTER in a chat in which he is not present"))
                let promise2 = subscribeEventOnce(client, SocketEvent.CHAT_USER_NOT_FOUND, user => expect(user).eq(_IdUser))
                let promise3 = subscribeEventOnce(client, SocketEvent.OPERATION_NOT_AUTHORIZED, () => assert.fail(firedEvent(SocketEvent.OPERATION_NOT_AUTHORIZED)))

                client.emit("chat:enter", getChatInfo(IChat.Type.ONE))

                return Promise.race([promise1, promise2, promise3])
            })

            it("signed user with valid token", function (){
                let typeChat = IChat.Type.ONE
                let numClient = 1
                let client = getClient(numClient)
                let user = getUserIdentifierOfClient(numClient)

                let promise1 = subscribeEventOnce(client, SocketEvent.CHAT_ENTER, ({chatName, enteredUser}) => {
                    expect(chatName).eq(getExceptedChatName(typeChat))
                    expect(enteredUser).eq(user)
                })
                let promise2 = subscribeEventOnce(client, SocketEvent.CHAT_USER_NOT_FOUND, () => assert.fail(firedEvent(SocketEvent.CHAT_USER_NOT_FOUND)))
                let promise3 = subscribeEventOnce(client, SocketEvent.OPERATION_NOT_AUTHORIZED, () =>  assert.fail(firedEvent(SocketEvent.OPERATION_NOT_AUTHORIZED)))

                client.emit("chat:enter", getChatInfo(typeChat))

                return Promise.race([promise1, promise2, promise3])
            })

        })

        describe("Leave", function (){

            it("no signed user with valid token in which he is not enter", function (){
                let numClient = 2
                let client = getClient(numClient)
                let user = getUserIdentifierOfClient(numClient)

                let promise1 = subscribeEventOnce(client, SocketEvent.CHAT_LEAVE, () => assert.fail(firedEvent(SocketEvent.CHAT_LEAVE) + "Signed user MUST NOT LEAVE a chat in which he is not enter"))
                let promise2 = subscribeEventOnce(client, SocketEvent.CHAT_USER_NOT_ENTERED, leavedUser => {
                    expect(leavedUser).eq(user)
                })
                client.emit("chat:leave", getChatInfo(IChat.Type.ONE))

                return Promise.race([promise1, promise2])
            })

            it("signed user with valid token (GROUP) async", function (){
                let typeChat = IChat.Type.GROUP
                return allUsersEnterInChat(typeChat)
                    .then(function (){

                        let _pos1 = 1
                        let _pos2 = 2
                        let client1 = getClient(_pos1)
                        let client2 = getClient(_pos2)
                        let user1 = getUserIdentifierOfClient(_pos1)
                        let user2 = getUserIdentifierOfClient(_pos2)

                        const leaveChatGroup = (client, _leavedUsers = []) => {

                            let othersUsersInChats = getClientsOnChat(typeChat, c => c !== client && !Array.from(_leavedUsers).includes( getUserInfoOfClientInChat(c, typeChat)?._id) )

                            let promises = othersUsersInChats.map(cl =>
                                new Promise((resolve, reject) => {
                                    let userinfo = getUserInfoOfClientInChat(client, typeChat)
                                    subscribeEventOn(cl, SocketEvent.CHAT_LEAVE, ({chatName, enteredUser}) => {
                                        expect(chatName).eq(getExceptedChatName(typeChat))
                                        expect(enteredUser).oneOf([user1, user2])
                                        let callerUserInfo = getUserInfoOfClientInChat(cl, typeChat)
                                        console.debug("I am client " + callerUserInfo.userID  + " on leave : " +  enteredUser, ", otherClients ", othersUsersInChats.length)
                                        resolve(enteredUser)
                                    }, ({enteredUser}) => enteredUser === userinfo._id).catch(reject)
                                })
                            )


                            let promisesAll = othersUsersInChats.length ? Promise.all(promises)
                                    .then(results => {
                                        console.debug("(Leaver): I am client " + getUserInfoOfClientInChat(client, typeChat).userID ," => Results = ", results);
                                        return Array.from(new Set(results))
                                    })
                                : Promise.resolve(["Notified to anyone"])

                            let promiseErr = subscribeEventOnce(client, SocketEvent.CHAT_USER_NOT_ENTERED, () => assert.fail(firedEvent(SocketEvent.CHAT_USER_NOT_ENTERED)))

                            client.emit("chat:leave", getChatInfo(typeChat))

                            return Promise.race([promisesAll, promiseErr])
                        }

                        return leaveChatGroup(client1)
                            .then((_leavedUsers) => leaveChatGroup(client2, _leavedUsers).then(users => [..._leavedUsers, ...users]))
                            .then((_leavedUsers) => expect(_leavedUsers).all.members([user1, user2]))

                    })
            })


            it("signed user with valid token (ONE TO ONE)", function (){
                let typeChat = IChat.Type.ONE
                return allUsersEnterInChat(typeChat)
                    .then(() => {

                        let numClient = 1
                        let client = getClient(numClient)
                        let user = getUserIdentifierOfClient(numClient)
                        let othersUsersInChats = getClientsOnChat(typeChat, c => c !== client)

                        let promise1 = subscribeEventOnce(client, SocketEvent.CHAT_USER_NOT_ENTERED, () => assert.fail(firedEvent(SocketEvent.CHAT_USER_NOT_ENTERED)))
                        let promise2 = othersUsersInChats.length === 1 ? subscribeEventOnce(othersUsersInChats[0], SocketEvent.CHAT_LEAVE, ({enteredUser}) => expect(enteredUser).eq(user))
                            : othersUsersInChats.length === 0 ? Promise.resolve("Notified to anyone")
                                : Promise.reject(assert.fail("No Chat One to One"))

                        client.emit("chat:leave", getChatInfo(typeChat))

                        return Promise.race([promise1, promise2])

                    })
            })

        })

        describe("Read message/s", function (){
            let client2_1;

            before(() => {
                client2_1 = createNewClientFrom(2)
                return connectClient(client2_1)
            })
            after(() => Promise.all([
                disconnectClient(client2_1),
                allUsersLeaveChat(IChat.Type.ONE),
                allUsersLeaveChat(IChat.Type.GROUP)
            ]))

            it("no signed user with valid token in which he is not enter", function (){
                let typeChat = IChat.Type.GROUP
                let numClient = 2
                let client = getClient(numClient)
                return allUsersEnterInChat(typeChat, client)
                    .then(({chatName}) => {

                        let reader = getUserIdentifierOfClient(numClient)

                        let otherUser = getClientsOnChat(typeChat, c => c !== client)[0]

                        let sender = getUserIdentifierOfClient(1)

                        let msg = readMessage(sender, reader)

                        let errMex = "Signed user MUST NOT READ messages in a chat in which he is not enter"
                        let promise1 = subscribeEventOnce(otherUser, SocketEvent.CHAT_READ_MESSAGES, () => assert.fail(firedEvent(SocketEvent.CHAT_READ_MESSAGES) + errMex))
                        let promise2 = subscribeEventOnce(otherUser, SocketEvent.OPERATION_NOT_AUTHORIZED, () => assert.fail(firedEvent(SocketEvent.OPERATION_NOT_AUTHORIZED)))
                        let promise3 = subscribeEventOnce(client, SocketEvent.CHAT_USER_NOT_ENTERED, enteredUser => expect(enteredUser).eq(reader))

                        client.emit("chat:read", chatName, [msg])

                        return Promise.race([promise1, promise2, promise3])
                    })
            })

            it("from user who has two open connections (one in chat and other no)", function (){
                let typeChat = IChat.Type.ONE
                return allUsersEnterInChat(typeChat)
                    .then(({chatName}) => {

                        let pos2 = 2
                        let client2 = getClient(pos2)

                        let user1 = getUserIdentifierOfClient(1)
                        let user2 = getUserIdentifierOfClient(pos2)

                        let msg = readMessage(user1, user2)

                        let promise1 = subscribeEventOnce(client2, SocketEvent.OPERATION_NOT_AUTHORIZED, () => assert.fail(firedEvent(SocketEvent.OPERATION_NOT_AUTHORIZED)))
                        let promise2 = subscribeEventOnce(client2, SocketEvent.CHAT_USER_NOT_ENTERED, () => assert.fail(firedEvent(SocketEvent.CHAT_USER_NOT_ENTERED)))
                        let promise3 = subscribeEventOnce(client2_1, SocketEvent.CHAT_READ_MESSAGES, (args) => {
                            let info = args[0]?.info
                            let messages = args[0]?.messages

                            expect(messages[0]).to.deep.eq(msg)

                            let expInfoChat = getExceptedChatInfo(typeChat)

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

            it("from user in ONE to ONE chat.", function (){
                let typeChat = IChat.Type.ONE
                return allUsersEnterInChat(typeChat)
                    .then(({chatName}) => {
                        let pos1 = 1
                        let pos2 = 2

                        let client1 = getClient(pos1)
                        let client2 = getClient(pos2)

                        let user1 = getUserIdentifierOfClient(pos1)
                        let user2 = getUserIdentifierOfClient(pos2)

                        let msg = readMessage(user1, user2)

                        let promise1 = subscribeEventOnce(client2, SocketEvent.OPERATION_NOT_AUTHORIZED, () => assert.fail(firedEvent(SocketEvent.OPERATION_NOT_AUTHORIZED)))
                        let promise2 = subscribeEventOnce(client2, SocketEvent.CHAT_USER_NOT_ENTERED, () => assert.fail(firedEvent(SocketEvent.CHAT_USER_NOT_ENTERED)))
                        let promise3 = subscribeEventOnce(client1, SocketEvent.CHAT_READ_MESSAGES, (messages) => expect(messages[0]).to.deep.eq(msg))


                        client2.emit("chat:read", chatName, [msg])

                        return Promise.race([promise1, promise2, promise3])
                    })
            })

            it("from user in GROUP chat.", function (){
                let typeChat = IChat.Type.GROUP
                return allUsersEnterInChat(typeChat)
                    .then(({chatName}) => {

                        let pos5 = 5
                        let client5 = getClient(pos5)
                        let user5 = getUserIdentifierOfClient(pos5) // who read
                        let user2 = getUserIdentifierOfClient(2) // who read

                        let user1 = getUserIdentifierOfClient(1) // sender

                        let msg = readMessage(user1, user2, user5)

                        let promise1 = subscribeEventOnce(client5, SocketEvent.OPERATION_NOT_AUTHORIZED, () => assert.fail(firedEvent(SocketEvent.OPERATION_NOT_AUTHORIZED)))
                        let promise2 = subscribeEventOnce(client5, SocketEvent.CHAT_USER_NOT_ENTERED, () => assert.fail(firedEvent(SocketEvent.CHAT_USER_NOT_ENTERED)))

                        let promise3 = Promise.all(
                            getClientsOnChat(typeChat, c => c !== client5)
                                .map(c => subscribeEventOnce(c, SocketEvent.CHAT_READ_MESSAGES, (messages) => {
                                    let mex = messages[0]
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

        describe("Send message",function (){

            it("no signed user with valid token in which he is not enter", function (){

                let typeChat = IChat.Type.ONE

                let numClient = 1
                let client = getClient(numClient)
                let user = getUserIdentifierOfClient(numClient)

                let otherUser = getClientsOnChat(typeChat, c => c !== client)[0]

                const blockSendMessage = (cc, chatName) => {

                    let errMex = "Signed user MUST NOT SEND MESSAGES in a chat in which he is not enter"
                    let promise1 = subscribeEventOnce(otherUser, SocketEvent.CHAT_PUSH_MESSAGES, () => assert.fail(firedEvent(SocketEvent.CHAT_PUSH_MESSAGES) + errMex))
                    let promise2 = subscribeEventOnce(otherUser, SocketEvent.CHAT_MESSAGES, () => assert.fail(firedEvent(SocketEvent.CHAT_MESSAGES) + errMex))
                    let promise3 = subscribeEventOnce(cc, SocketEvent.CHAT_USER_NOT_ENTERED, enteredUser => expect(enteredUser).eq(user))

                    cc.emit("chat:messages", chatName, message(user))

                    return Promise.race([promise1, promise2, promise3])
                }

                return Promise.all([
                    enterInChat(otherUser, typeChat).then(chatName => blockSendMessage(client, chatName)),
                    blockSendMessage(client, getExceptedChatName(typeChat))
                ])

            })

            it("to user in ONE to ONE chat.", function (){
                let typeChat = IChat.Type.ONE

                return allUsersEnterInChat(typeChat)
                    .then(({chatName}) => {

                        let numClient = 2
                        let client = getClient(numClient)
                        let user = getUserIdentifierOfClient(numClient)

                        let othersUsersInChats = getClientsOnChat(typeChat, c => c !== client)

                        let msg = message(user)

                        let promise1 = subscribeEventOnce(othersUsersInChats[0], SocketEvent.CHAT_MESSAGES, (messages) => expect(messages[0]).to.deep.eq(msg))
                        let promise2 = subscribeEventOnce(client, SocketEvent.OPERATION_NOT_AUTHORIZED, () => assert.fail(firedEvent(SocketEvent.OPERATION_NOT_AUTHORIZED)))

                        client.emit("chat:messages", chatName, msg)

                        return Promise.race([promise1, promise2])
                    })
            })

            it("to user that it is not in chat right now.", function (){
                let typeChat = IChat.Type.ONE

                let numClient = 1
                let client = getClient(numClient)
                let user = getUserIdentifierOfClient(numClient)

                return enterInChat(client, typeChat)
                    .then(chatName => {

                        let msg = message(user)

                        let otherUser = getClientsOnChat(typeChat, c => c !== client)[0]

                        let promise1 = subscribeEventOnce(otherUser, SocketEvent.CHAT_PUSH_MESSAGES, (args) => {
                            let info = args[0]?.info
                            let messages = args[0]?.messages

                            expect(messages[0]).to.deep.eq(msg)

                            let expInfoChat = getExceptedChatInfo(typeChat)

                            expect(info.name).undefined
                            expect(info.name).eq(expInfoChat.name)
                            expect(info.type).eq(expInfoChat.type)
                            expect(info._id).eq(expInfoChat._id)
                            expect(info.usersRole).to.deep.eq(expInfoChat.usersRole)

                        })
                        let promise2 = subscribeEventOnce(client, SocketEvent.OPERATION_NOT_AUTHORIZED, () => assert.fail(firedEvent(SocketEvent.OPERATION_NOT_AUTHORIZED)))

                        client.emit("chat:messages", chatName, msg)

                        return Promise.race([promise1, promise2])
                    })
            })

            it("to users in GROUP chat", function (){
                let _pos1 = 1
                let _pos2 = 2
                let client1 = getClient(_pos1)
                let client2 = getClient(_pos2)
                let user2 = getUserIdentifierOfClient(_pos2)

                let typeChat = IChat.Type.GROUP

                return Promise.all([enterInChat(client1, typeChat), enterInChat(client2, typeChat)])
                    .then(results => {
                        let chatName = results[0]

                        let _pos5 = 5
                        let client5 = getClient(_pos5)

                        const sendMessagesInChatGroup = (client, message) => {
                            let otherClients = getClientsOnChat(typeChat, c => c !== client)

                            if(otherClients.length <= 0) return Promise.reject(assert.fail("No other users in chat."))
                            else {
                                let promise1 = subscribeEventOn(client5, SocketEvent.CHAT_PUSH_MESSAGES, messages => {
                                    const _message = messages[0]
                                    let callerUserInfo = getUserInfoOfClientInChat(client5, typeChat)
                                    console.debug("I am client " + callerUserInfo.userID  + " on sending messages : " +  JSON.stringify(_message.info))

                                    let expInfoChat = getExceptedChatInfo(typeChat)

                                    expect(_message.info.name).eq(expInfoChat.name)
                                    expect(_message.info.type).eq(expInfoChat.type)
                                    expect(_message.info._id).eq(expInfoChat._id)
                                    expect(_message.info.usersRole).to.deep.eq(expInfoChat.usersRole)

                                    expect(_message.messages).to.deep.eq([message])
                                })

                                let promise2 = subscribeEventOn(client1, SocketEvent.CHAT_MESSAGES, messages => {
                                    const _message = messages[0]
                                    let callerUserInfo = getUserInfoOfClientInChat(client1, typeChat)
                                    console.debug("I am client " + callerUserInfo.userID  + " on sending messages : " +  JSON.stringify(_message))
                                    expect(_message.sender).to.deep.eq(message.sender)
                                    expect(_message.content).to.deep.eq(message.content)
                                })

                                client.emit("chat:messages", chatName, message)

                                return Promise.all([promise1, promise2])
                            }
                        }

                        let operationNotAuthPromise = subscribeEventOnce(client2, SocketEvent.OPERATION_NOT_AUTHORIZED, () => assert.fail(firedEvent(SocketEvent.OPERATION_NOT_AUTHORIZED)))
                        let userNotEnteredPromise = subscribeEventOnce(client2, SocketEvent.CHAT_USER_NOT_ENTERED, () => assert.fail(firedEvent(SocketEvent.CHAT_USER_NOT_ENTERED)))
                        let sendMessagesInChatGroupPromise = sendMessagesInChatGroup(client2, message(user2))

                        return Promise.race([ sendMessagesInChatGroupPromise, userNotEnteredPromise, operationNotAuthPromise ])
                    })
            })
        })

        describe("Typing", function (){

            beforeEach(() => {
                return allUsersLeaveChat(IChat.Type.ONE)
            })

            it("no signed user with valid token in which he is not enter", function (){
                let typeChat = IChat.Type.ONE

                let numClient = 2
                let client = getClient(numClient)
                let user = getUserIdentifierOfClient(numClient)
                let userInfo = getUserInfoOfClientInChat(client, typeChat)

                let otherUser = getClientsOnChat(typeChat, c => c !== client)[0]

                let chatName = getExceptedChatName(typeChat)

                let errMex = "Signed user MUST NOT TYPING in a chat in which he is not enter"
                let promise1 = subscribeEventOnce(otherUser, SocketEvent.CHAT_TYPING, () => assert.fail(firedEvent(SocketEvent.CHAT_TYPING) + errMex))
                let promise2 = subscribeEventOnce(otherUser, SocketEvent.OPERATION_NOT_AUTHORIZED, () => assert.fail(firedEvent(SocketEvent.OPERATION_NOT_AUTHORIZED)))
                let promise3 = subscribeEventOnce(client, SocketEvent.CHAT_USER_NOT_ENTERED, enteredUser => expect(enteredUser).eq(user))

                client.emit("chat:typing", chatName, {_id: userInfo._id, userID: userInfo.userID, typing: true })
                return Promise.race([promise1, promise2, promise3])

            })

            it("of one user (ONE TO ONE)", function (){
                let typeChat = IChat.Type.ONE
                return allUsersEnterInChat(typeChat)
                    .then(({chatName}) => {

                        let numClient = 1
                        let client = getClient(numClient)
                        let user = getUserIdentifierOfClient(numClient)
                        let userInfo = getUserInfoOfClientInChat(client, typeChat)
                        let othersUsersInChats = getClientsOnChat(typeChat, c => c !== client)

                        let promise1 = subscribeEventOnce(client, SocketEvent.OPERATION_NOT_AUTHORIZED, () => assert.fail(firedEvent(SocketEvent.OPERATION_NOT_AUTHORIZED)))
                        let promise2 = othersUsersInChats.length === 1 ? subscribeEventOnce(othersUsersInChats[0], SocketEvent.CHAT_TYPING, (data) => {
                                let callerUserInfo = getUserInfoOfClientInChat(othersUsersInChats[0], typeChat)
                                console.debug("I am client " + callerUserInfo.userID  + " on typing : " +  JSON.stringify(data))
                                expect(data._id).eq(user)
                                expect(data.typing).true
                            })
                            : Promise.reject( assert.fail(othersUsersInChats.length === 0 ? "No other users in chat.": "No Chat One to One"))

                        client.emit("chat:typing", chatName, {_id: userInfo._id, userID: userInfo.userID, typing: true })

                        return Promise.race([promise1, promise2])
                    })
            })

            it("of more users (GROUP)", function (){
                let typeChat = IChat.Type.GROUP
                return allUsersEnterInChat(typeChat)
                    .then(({chatName}) => {

                        let _pos1 = 1
                        let _pos2 = 2
                        let _pos5 = 5

                        let client1 = getClient(_pos1)
                        let client2 = getClient(_pos2)
                        let client5 = getClient(_pos5)

                        let user1 = getUserIdentifierOfClient(_pos1)
                        let user2 = getUserIdentifierOfClient(_pos2)
                        let user5 = getUserIdentifierOfClient(_pos5)

                        const operationNotAuth = client => subscribeEventOnce(client, SocketEvent.OPERATION_NOT_AUTHORIZED, () => assert.fail(firedEvent(SocketEvent.OPERATION_NOT_AUTHORIZED)))

                        const typingInChatGroup = (client, typing) => new Promise((resolve, reject) => {
                            let userinfo = getUserInfoOfClientInChat(client, typeChat)
                            let otherClients = getClientsOnChat(typeChat, c => c !== client)

                            if(otherClients.length){
                                let _events = 0
                                otherClients.forEach(cl => {
                                    subscribeEventOn(cl, SocketEvent.CHAT_TYPING, data => {
                                            let callerUserInfo = getUserInfoOfClientInChat(cl, typeChat)
                                            console.debug("I am client " + callerUserInfo.userID  + " on typing : " +  JSON.stringify(data))
                                            expect(data._id).eq(userinfo._id)
                                            expect(data.typing).eq(typing)
                                            _events += 1
                                            console.debug("otherClients ", otherClients.length ,", _events ", _events," => RESOLVE ", _events === otherClients.length)
                                            if(_events === otherClients.length) resolve(data)
                                        },
                                        data => userinfo._id === data._id ).catch(reject)
                                })
                            }
                            else assert.fail("No other users in chat.")

                            client.emit("chat:typing", chatName, {_id: userinfo._id, userID: userinfo.userID, typing})
                        })


                        let promises1 = Promise.all([
                            typingInChatGroup(client1, false),
                            typingInChatGroup(client2, true),
                            typingInChatGroup(client5, true)
                        ])
                            .then((results) => {
                                expect(results.map(t => t._id)).all.members([user1, user2, user5])
                                expect(results.map(t => t.typing)).all.members([false, true, true])
                            })
                        let promises2 = Promise.race([ operationNotAuth(client1), operationNotAuth(client2), operationNotAuth(client5) ])

                        return Promise.race([promises1, promises2])
                    })
            })
        })

    })

    describe("3 - Disconnection", function (){

        before(disconnectAllClients)

        beforeEach(connectAllClients)

        it("of a signed user", function (){
            let numClient = 1
            let client = getClient(numClient)
            let user = getUserIdentifierOfClient(numClient)

            client.disconnect()

            let othersClients = filterOnlineClients(client)
            expect(othersClients).to.lengthOf(maxClients() - 1)

            return Promise.all(
                othersClients.map(cl => subscribeEventOn(cl, SocketEvent.USER_OFFLINE, (id, date) => {
                    expect(id).eq(user)
                    expect(date).approximately(Date.now(), 10000)
                }))
            )
        })

        it("of an anonymous user", function (){
            let client = getClient(3)

            client.disconnect()

            let othersClients = filterOnlineClients(client)
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
