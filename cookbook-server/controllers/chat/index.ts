import {Chat, Message, User} from "../../models";
import {Types} from "mongoose";
import {ChatPopulationPipeline, IChat} from "../../models/schemas/chat";
import {
    checkRequestHeaders,
    existById,
    FileConfigurationImage,
    fileUploader,
    getRestrictedUser,
    paginationOf
} from "../index";
import {RBAC} from "../../modules/rbac";
import ObjectId = Types.ObjectId;
import {MongooseValidationError} from "../../modules/custom.errors";
import Operation = RBAC.Operation;
import Subject = RBAC.Subject;
import * as _ from "lodash"
import {decodeToArray, randomString, isTrue} from "../../modules/utilities";
import * as path from "path";
import Role = RBAC.Role;
import {DecodedTokenType} from "../../modules/jwt.token";


export function uploadChatImage(){
    let config = {...FileConfigurationImage, ...{
        newFileName: function (file: any){
            return 'chat-image-' + randomString(30) + path.extname(file.originalname)
        }
    }}
    return fileUploader.single('image', config)
}

async function getBodyFromFormData(req: any, res: any): Promise<any> {
    const body = req.body
    const user_id = req.params.id

    const _body: any = { info: {} }

    try {
        _body.users = _.uniqBy(decodeToArray(body.users), 'user')
        if(!_body.users.every(i => i.user)) {
            let message: string = 'Elements of \'Users\' must be of the form : { user: string, role?: string }'
            res.status(400).json({ description: message })
            return Promise.reject(message)
        }
        if(!_body.users.every(i => i.user == RBAC.Role.ADMIN)) await existById(User, _body.users.map(c => c.user))
    } catch (e){
        if(Array.isArray(e)){
            let message: string = 'Users [' + e + '] are not founds.'
            res.status(404).json({ description: message })
            return Promise.reject(message)
        }
        else {
            let message: string = 'users must be array and have at least one element.'
            res.status(400).json({ description: message })
            return Promise.reject(message)
        }
    }

    if(req.file) _body.info.img = req.file.filename
    if(body.name) _body.info.name = body.name
    if(body.message) _body.messages = body.message ? [new Message({ content: body.message, sender: user_id })] : undefined

    const me = _body.users.find(u => u.user === user_id)

    if(_body.users.length === 1 && me) {
        let message: string = '\'Users\' must contain at least one user different from ' + user_id
        res.status(400).json({ description: message })
        return Promise.reject(message)
    }
    _body.info.type = body.type || ( (_body.info.name || _body.users.length + (me ? 0 : 1) > 2 ) ? IChat.Type.GROUP: IChat.Type.ONE )
    if(IChat.Type.isGroupChat(_body.info.type) && !_body.info.name) {
        let message: string = 'A group chat must have a name'
        res.status(400).json({ description: message })
        return Promise.reject(message)
    }

    switch (_body.info.type as IChat.Type){
        case IChat.Type.ONE: {
            if(me) me.role = IChat.Role.WRITER
            else _body.users.unshift({ user: user_id })

            _body.info.name = undefined
            _body.info.img = undefined
        }
            break;
        case IChat.Type.GROUP: {
            if(me) me.role = IChat.Role.ADMIN
            else _body.users.unshift({ user: user_id , role: IChat.Role.ADMIN })
        }
            break;
        default: {
            let message: string = 'Required \'type\' in ' + IChat.Type.values()
            res.status(400).json({ description: message })
            return Promise.reject(message)
        }
    }
    console.debug('Create Chat Body = ', _body)

    return _body
}

export function create_chat(req, res) {
    if(checkRequestHeaders(req, res, {'content-type': 'multipart/form-data'})){
        const {id} = req.params
        if(!ObjectId.isValid(id)) return res.status(400).json({ description: 'Required a valid \'id\''})
        const user = getRestrictedUser(req, res, { operation: Operation.CREATE, subject: Subject.CHAT, others: decodedToken => decodedToken._id !== id })
        if(user) {
            getBodyFromFormData(req, res)
                .then(body => {

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

                }, err => console.error(err))
        }
    }
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
    let  {page, limit, name} = req.query
    let noMessages = req.query['no-messages']
    if(!ObjectId.isValid(id)) return res.status(400).json({ description: 'Required a valid \'id\''})
    const user = getRestrictedUser(req, res, { operation: Operation.RETRIEVE, subject: Subject.CHAT, others: decodedToken => decodedToken._id !== id })
    if(user) {

        const searchAvailableValue = ['partial', 'full']
        if(name) {
            try {
                name = JSON.parse(name)
                if(!name.search || !name.value) throw new Error()
            } catch (e) {
                return res.status(400).json({ description: 'Parameter \'name\' is malformed. It must be of form: {"search": string, "value": string}' })
            }
            if(!searchAvailableValue.includes(name.search)) return res.status(400).json({ description: `Parameter \'name.search\' must be in ${searchAvailableValue}.` })
        }

        const pipelinePopulatedChat = _.cloneDeep(ChatPopulationPipeline)
        const filtersGroup = { 'info.type': IChat.Type.GROUP, 'users.user': user._id }
        const filtersOne = { 'info.type': IChat.Type.ONE , 'users.user': user._id }
        if(name) {
            let regexObject = { $regex: `^${name.value}`, $options: "i" }
            if(name.search === 'full') regexObject['$regex']+='$'
            filtersGroup['info.name'] = regexObject
            Object.assign(pipelinePopulatedChat[0].match, { 'credential.userID' : regexObject })
        }
        console.debug('filtersGroup ', filtersGroup, ' pipelinePopulatedChat ', pipelinePopulatedChat)
        Promise.all([Chat.find(filtersGroup).populate(ChatPopulationPipeline), Chat.find(filtersOne).populate(pipelinePopulatedChat)])
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

                   if(isTrue(noMessages)) _chats = _chats.map(chat => remapWithoutMessages(chat, user._id))

                   return res.status(200).json(paginationOf(_chats, page && limit ? { page: +page, limit: +limit } : undefined))
               }, err => res.status(500).json({ description: err.message}))
    }
}

export function chat(req, res) {
    const {id, chatID} = req.params
    if(!ObjectId.isValid(id)) return res.status(400).json({ description: 'Required a valid \'id\''})
    if(!ObjectId.isValid(chatID)) return res.status(400).json({ description: 'Required a valid \'chatID\''})
    let noMessages = req.query['no-messages']

    const user = getRestrictedUser(req, res, { operation: Operation.RETRIEVE, subject: Subject.CHAT, others: decodedToken => decodedToken._id !== id })
    if(user) {
        Chat.findOne()
            .where('users.user').equals(ObjectId(user._id))
            .where('_id').equals(chatID)
            .then(chat => {
                if(!chat) return res.status(404).json({description: 'Chat is not found.'})
                return res.status(200).json(isTrue(noMessages) ? remapWithoutMessages(chat, user._id) : chat )
            }, err => res.status(500).json({ description: err.message }))
    }
}

export function delete_chat(req, res) {
    const {id, chatID} = req.params
    if(!ObjectId.isValid(id)) return res.status(400).json({ description: 'Required a valid \'id\''})
    if(!ObjectId.isValid(chatID)) return res.status(400).json({ description: 'Required a valid \'chatID\''})
    const user = getRestrictedUser(req, res, { operation: Operation.DELETE, subject: Subject.CHAT, others: decodedToken => decodedToken._id !== id })
    if(user) {
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
}

enum ChatUpdateAction{
    UPDATE_USER_ROLE = 'update-user-role',
    UPDATE_CHAT_NAME = 'update-chat-name',
    ADD_USERS = 'add-users',
    UPDATE_CHAT_IMAGE = 'update-chat-image',
}
export function update_chat(req, res, err) {
    const {id, chatID} = req.params
    if(!ObjectId.isValid(id)) return res.status(400).json({ description: 'Required a valid \'id\''})
    if(!ObjectId.isValid(chatID)) return res.status(400).json({ description: 'Required a valid \'chatID\''})

    const {action} = req.query
    const body = req.body

    const actionsAvailableChatOne = [ChatUpdateAction.UPDATE_USER_ROLE]
    const actionsAvailableChatGroup = [ChatUpdateAction.UPDATE_CHAT_NAME, ChatUpdateAction.UPDATE_USER_ROLE, ChatUpdateAction.ADD_USERS, ChatUpdateAction.UPDATE_CHAT_IMAGE]

    const user = getRestrictedUser(req, res, { operation: Operation.UPDATE, subject: Subject.CHAT, others: decodedToken => decodedToken._id !== id })
    if(user){

        Chat.findOne()
            .where('users.user').equals(ObjectId(user._id))
            .where('_id').equals(chatID)
            .then(chat => {
                if(!chat) return res.status(404).json({description: 'Chat is not found.'})

                switch (chat.info.type as IChat.Type) {
                    case IChat.Type.ONE:
                    {
                        switch (action as ChatUpdateAction) {
                            //- role READER to WRITER
                            case ChatUpdateAction.UPDATE_USER_ROLE: {
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
                    case IChat.Type.GROUP: //TODO: DA RIGUARDARE MEGLIO
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


                        switch (action as ChatUpdateAction){
                            case ChatUpdateAction.UPDATE_CHAT_NAME: {
                                if(checkAuthorization(user)) {
                                    if(!body.name) return res.status(400).json({ description: 'Body must be of the form: { name: string } ' })

                                    chat.info.name = body.name
                                    chat.save().then(_chat => res.status(200).json({ description: 'Update name of chat.'}), err => res.status(500).json({ description: err.message }))
                                }
                            }
                            break;
                            case ChatUpdateAction.UPDATE_USER_ROLE: {
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
                                                       console.log('Body users unique = ', bodyUsers, ', now present users: ',_users, ', diff = ', diff)

                                                       //- role READER to WRITER/ADMIN   -> ri aggiunge utente
                                                       //- role WRITER to ADMIN          -> rende un utente amministratore
                                                       //- role WRITER to READER         -> rimuove utente
                                                       bodyUsers.forEach(uu => {
                                                           const _user = chat.users.find(_uu => _uu.user._id == uu.user)
                                                           const oldRole = _user.role
                                                           _user.role = uu.role;
                                                           console.log('old role = ', oldRole, ', new role = ', _user.role)
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
                            case ChatUpdateAction.ADD_USERS: {
                                if(checkAuthorization(user)){
                                    const bodyUsers = _.uniqBy(body.users, 'user')
                                    if(!bodyUsers.length || !bodyUsers.every(u => u.user))
                                        return res.status(400).json({ description: 'Body must be of the form: [{ user: string, role?: string }, ....] with \'role\' in [' + IChat.Role.values() + ']'})

                                    existById(User, bodyUsers.map(u => u.user))
                                        .then(() => {

                                            const _users = chat.users.map(u => u.user._id.toString())
                                            const diff = bodyUsers.filter(u => _users.includes(u.user))

                                            if(diff.length) return res.status(409).json({ description: 'Users '+JSON.stringify(diff)+' are already in chat'})
                                            console.log('Body users unique = ', bodyUsers, ', now present users: ',_users, ', diff = ', diff)

                                            chat.users.push(...bodyUsers)
                                            saveUpdatedChatUsers(chat, { res, message: 'Add users on chat.'})

                                        }, ids => res.status(404).json({description: 'Users ['+ids+'] are not found.'}))
                                }
                            }
                            break;
                            case ChatUpdateAction.UPDATE_CHAT_IMAGE: {
                                if(checkAuthorization(user) && checkRequestHeaders(req, res, {'content-type': 'multipart/form-data'})){
                                    uploadChatImage()(req, res, function (err) {
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

}

function areAllUserAdmin(chat: IChat, user: DecodedTokenType): Promise<boolean>{
    return User.find()
               .where('credential.role').equals(Role.ADMIN)
               .select('_id')
               .then(admins => Promise.resolve( chat.users.filter(u => u.user._id != user._id).every(u => _.findIndex(admins, {_id: u.user._id}) != -1)),
                     err => Promise.reject(err))
}