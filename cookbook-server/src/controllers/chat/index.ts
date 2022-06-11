import {Chat, User} from "../../models";
import {Types} from "mongoose";
import {ChatPopulationPipeline, IChat} from "../../models/schemas/chat";
import {existById} from "../../database/utils";
import {RBAC} from "../../libs/rbac";
import ObjectId = Types.ObjectId;
import {MongooseValidationError} from "../../libs/custom.errors";
import * as _ from "lodash"
import Role = RBAC.Role;
import {DecodedTokenType} from "../../libs/jwt.token";
import {chatMiddleware} from "../../middlewares";
import UpdateAction = chatMiddleware.UpdateAction
import {Pagination} from "../../libs/pagination";

export function create_chat(req, res) {
    const body = req.locals.body

    const _createChat = () =>{
        Chat.find({ 'users.user': { $all: body.users.map(u => u.user) }, 'info.name': body.info.name })
            .then(chats => {
                console.debug('Chats ', chats)
                if(chats.length) return res.status(409).json({ description: 'Chat has just created.', chatID: chats[0]._id })

                new Chat(body)
                    .save()
                    .then(chat => {
                        chat.populate(ChatPopulationPipeline, function (err, populateChat){
                            if(err) return res.status(500).json({ description: err.message })
                            return res.status(201).json(populateChat)
                        })
                    }, err => res.status(MongooseValidationError.is(err)? 400: 500).json({ description: err.message }))

            }, err =>  res.status(500).json({ description: err.message }))
    }

    if(body.users.some(i => i.user == RBAC.Role.ADMIN)) {
        console.debug('Add admins')
        User.find()
            .where('credential.role').equals(RBAC.Role.ADMIN)
            .then(admins => {
                if(admins.length === 0) return res.status(404).json({ description: 'Admins are not found' })
                let index = body.users.findIndex(i => (i.user == RBAC.Role.ADMIN))
                let adminRole = body.users[index].role
                body.users.splice(index, 1)
                admins.forEach(admin => body.users.push({user: admin._id, role: adminRole}))
                _createChat()
            }, err =>  res.status(500).json({ description: err.message }) )
    } else _createChat()
}

function remapWithoutMessages(chat: IChat, userID: string): any {
    let _chat: any = chat.toObject()
    _chat.unreadMessages = chat.messages.filter(m => m.sender?._id != userID)
                                        .filter(m => !m.read.find(r => r.user?._id == userID))
                                        .length
    delete _chat.messages
    console.debug('remapped chat = ', _chat)
    return _chat
}

export function list_chat(req, res) {
    const {id} = req.params
    const {page, limit} = req.query
    const {user, noMessages} = req.locals
    const filtersGroup = req.locals.filters.group
    const filtersOne = req.locals.filters.one

    Promise.all([Chat.find(filtersGroup.filter).populate(filtersGroup.pipeline), Chat.find(filtersOne.filter).populate(filtersOne.pipeline)])
        .then(results => {
            let [chatGroup, chatOne] = results

            let _chats: any[] = chatGroup
            _chats.push(...(chatOne.filter(c => c.users.some(u => u.user && u.user._id != id))))
            _chats.sort((c1, c2) => {
                const c1LastMessageIndex = c1.messages.length - 1, c2LastMessageIndex = c2.messages.length - 1,
                    c1Message = c1.messages[c1LastMessageIndex], c2Message = c2.messages[c2LastMessageIndex],
                    c1Timestamp = c1Message ? c1Message.timestamp : 0, c2TimeStamp = c2Message ? c2Message.timestamp : 0
                return c2TimeStamp - c1Timestamp
            })

            if(noMessages) _chats = _chats.map(chat => remapWithoutMessages(chat, user._id))

            return res.status(200).json(Pagination.ofArray(_chats, page && limit ? { page: +page, limit: +limit } : undefined))
        }, err => res.status(500).json({ description: err.message}))
}

export function chat(req, res) {
    const {chatID} = req.params
    const noMessages = req.locals.noMessages
    const user = req.locals.user

    Chat.findOne()
        .where('users.user').equals(ObjectId(user._id))
        .where('_id').equals(chatID)
        .then(chat => {
            if(!chat) return res.status(404).json({description: 'Chat is not found.'})
            return res.status(200).json(noMessages ? remapWithoutMessages(chat, user._id) : chat )
        }, err => res.status(500).json({ description: err.message }))
}

export function delete_chat(req, res) {
    const {chatID} = req.params
    const user = req.locals.user

    Chat.findOne()
        .where('users.user').equals(ObjectId(user._id))
        .where('_id').equals(chatID)
        .then(chat => {
            if(!chat) return res.status(404).json({description: 'Chat is not found.'})

            const _user = chat.users.find(u => u.user._id == user._id)
            _user.role = IChat.Role.READER;
            _user.exitedAt = Date.now();

            (chat.users.every(u => IChat.Role.isReader(u.role)) ? chat.remove() : chat.save())
                .then(_chat => res.status(200).json({ description: 'Chat has been deleted.'}),
                    err => res.status(500).json({ description: err.message }))

        }, err => res.status(500).json({ description: err.message }))
}

export function update_chat(req, res) {
    const {chatID} = req.params
    const {action} = req.query
    const body = req.body
    const user = req.locals.user
    const actionsAvailableChatOne = req.locals.actionsAvailableChatOne
    const actionsAvailableChatGroup = req.locals.actionsAvailableChatGroup

    Chat.findOne()
        .where('users.user').equals(ObjectId(user._id))
        .where('_id').equals(chatID)
        .then(chat => {
            if(!chat) return res.status(404).json({description: 'Chat is not found.'})

            switch (chat.info.type as IChat.Type) {
                case IChat.Type.ONE:
                {
                    switch (action as UpdateAction) {
                        //- role READER to WRITER
                        case UpdateAction.UPDATE_USER_ROLE: {
                            if(!body.role || !IChat.Role.values().includes(body.role)) return res.status(400).json({ description: 'Body must be of the form: { role: string } with \'role\' in [' + IChat.Role.values() + ']' })
                            const _user = chat.users.find(u => u.user._id == user._id)
                            _user.role = body.role
                            chat.save().then(_chat => res.status(200).json({description: 'Update my role in chat.'}), err => res.status(500).json({ description: err.message }))
                        }
                            break;
                        default: return res.status(400).json({ description: 'Query \'action\' must in [' + actionsAvailableChatOne + ']' })
                    }
                }
                    break;
                case IChat.Type.GROUP: //Note: In Client is not implemented action = update-chat-name | add-users | update-chat-image
                {

                    const checkAuthorization = (user: DecodedTokenType) => {
                        const _user = chat.users.find(u => u.user._id == user._id && IChat.Role.isAdmin(u.role))
                        if(!_user) return res.status(403).json({description: 'User is unauthorized to update name of chat.'})
                        return true
                    }

                    const saveUpdatedChatUsers = (chat: IChat, response: {res: any, message: string}) => {
                        chat.save()
                            .then(_chat => {
                                _chat.populate(ChatPopulationPipeline, function (err, populatedChat){
                                    if(err) return response.res.status(500).json({ description: err.message })
                                    return response.res.status(200).json({ description: response.message, users: populatedChat.users })
                                })
                            }, err => response.res.status(MongooseValidationError.is(err) ? 400: 500).json({ description: err.message }) )
                    }


                    switch (action as UpdateAction){
                        case UpdateAction.UPDATE_CHAT_NAME: {
                            if(checkAuthorization(user)) {
                                if(!body.name) return res.status(400).json({ description: 'Body must be of the form: { name: string } ' })

                                chat.info.name = body.name
                                chat.save().then(_chat => res.status(200).json({ description: 'Update name of chat.'}), err => res.status(500).json({ description: err.message }))
                            }
                        }
                            break;
                        case UpdateAction.UPDATE_USER_ROLE: {
                            areAllUserAdmin(chat, user)
                                .then(allAdmin => {
                                    console.debug('Chat with all admin : ', allAdmin)
                                    if(allAdmin){
                                        const _user = chat.users.find(u => u.user._id == user._id)
                                        _user.role = body.role
                                        chat.save()
                                            .then(_chat => res.status(200).json({description: 'Update my role in chat with administrators.'}),
                                                err => res.status(500).json({description: err.message}))
                                    } else {
                                        if(checkAuthorization(user)){
                                            const bodyUsers = _.uniqBy(body.users, 'user')
                                            if(!bodyUsers.length || !bodyUsers.every(u => u.user && u.role))
                                                return res.status(400).json({ description: 'Body must be of the form: [{ user: string, role: string }, ....] with \'role\' in [' + IChat.Role.values() + ']'})

                                            existById(User, bodyUsers.map(u => u.user))
                                                .then(() => {

                                                    const _users = chat.users.map(u => u.user._id.toString())
                                                    const diff = bodyUsers.filter(u => !_users.includes(u.user))
                                                    if(diff.length) return res.status(404).json({ description: 'Users '+JSON.stringify(diff)+' are not in chat'})
                                                    console.debug('Body users unique = ', bodyUsers, ', now present users: ',_users, ', diff = ', diff)

                                                    //- role READER to WRITER/ADMIN   -> ri aggiunge utente
                                                    //- role WRITER to ADMIN          -> rende un utente amministratore
                                                    //- role WRITER to READER         -> rimuove utente
                                                    bodyUsers.forEach(uu => {
                                                        const _user = chat.users.find(_uu => _uu.user._id == uu.user)
                                                        const oldRole = _user.role
                                                        _user.role = uu.role;
                                                        console.debug('old role = ', oldRole, ', new role = ', _user.role)
                                                        if(IChat.Role.isReader(uu.role)) _user.exitedAt = Date.now();
                                                        if(IChat.Role.isReader(oldRole) && !IChat.Role.isReader(uu.role)) {
                                                            _user.exitedAt = undefined
                                                            _user.enteredAt = Date.now()
                                                        }
                                                    })
                                                    saveUpdatedChatUsers(chat, { res, message: 'Update users role on chat.'})


                                                }, ids => res.status(404).json({description: 'Users ['+ids+'] are not found.'}))
                                        }
                                    }
                                }, err => res.status(500).json({description: err.message}))
                        }
                            break;
                        case UpdateAction.ADD_USERS: {
                            if(checkAuthorization(user)){
                                const bodyUsers = _.uniqBy(body.users, 'user')
                                if(!bodyUsers.length || !bodyUsers.every(u => u.user))
                                    return res.status(400).json({ description: 'Body must be of the form: [{ user: string, role?: string }, ....] with \'role\' in [' + IChat.Role.values() + ']'})

                                existById(User, bodyUsers.map(u => u.user))
                                    .then(() => {

                                        const _users = chat.users.map(u => u.user._id.toString())
                                        const diff = bodyUsers.filter(u => _users.includes(u.user))

                                        if(diff.length) return res.status(409).json({ description: 'Users '+JSON.stringify(diff)+' are already in chat'})
                                        console.debug('Body users unique = ', bodyUsers, ', now present users: ',_users, ', diff = ', diff)

                                        chat.users.push(...bodyUsers)
                                        saveUpdatedChatUsers(chat, { res, message: 'Add users on chat.'})

                                    }, ids => res.status(404).json({description: 'Users ['+ids+'] are not found.'}))
                            }
                        }
                            break;
                        case UpdateAction.UPDATE_CHAT_IMAGE: {
                            if(checkAuthorization(user)){
                                chatMiddleware.uploadChatImage()(req, res, function (err) {
                                    if(err) return res.status(400).json({ description: err.message })
                                    if(!req.file || !req.file.filename) return res.status(400).json({ description: 'Body must be multipart/form-data with \'image\' file.' })
                                    chat.info.img = req.file.filename
                                    chat.save().then(_chat => res.status(200).json({ description: 'Update image of chat.'}), err => res.status(500).json({ description: err.message }))
                                })
                            }
                        }
                            break;
                        default: return res.status(400).json({ description: 'Query \'action\' must in [ '+ actionsAvailableChatGroup + ']'})
                    }
                }
                    break;
            }

        }, err => res.status(500).json({ description: err.message }))

}

function areAllUserAdmin(chat: IChat, user: DecodedTokenType): Promise<boolean>{
    return User.find()
               .where('credential.role').equals(Role.ADMIN)
               .select('_id')
               .then(admins => Promise.resolve( chat.users.filter(u => u.user._id != user._id).every(u => _.findIndex(admins, {_id: u.user._id}) != -1)),
                     err => Promise.reject(err))
}
