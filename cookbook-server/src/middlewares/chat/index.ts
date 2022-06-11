import {Types} from "mongoose";
import ObjectId = Types.ObjectId
import {checkRequestHeaders, Middleware, Middlewares, checkRestrictedRBAC, wrapUpload} from "../base";
import {RBAC} from "../../libs/rbac";
import Operation = RBAC.Operation;
import Resource = RBAC.Resource;
import {decodeToArray, decodeToBoolean, randomString} from "../../libs/utilities";
import * as path from "path";
import {FileUploader, UploaderConfiguration} from "../../libs/uploader";
import FileType = FileUploader.FileType;
import {FilesystemResource} from "../../filesystem";
import {ChatPopulationPipeline, IChat} from "../../models/schemas/chat";
import * as _ from "lodash"
import {existById} from "../../database/utils";
import {Message, User} from "../../models";

export enum UpdateAction{
    UPDATE_USER_ROLE = 'update-user-role',
    UPDATE_CHAT_NAME = 'update-chat-name',
    ADD_USERS = 'add-users',
    UPDATE_CHAT_IMAGE = 'update-chat-image',
}

export namespace UpdateAction {
    export function isUpdateImageAction(action: string): boolean {
        return (action as UpdateAction) === UpdateAction.UPDATE_CHAT_IMAGE
    }
}


export function uploadChatImage(): Middleware {

    let config: UploaderConfiguration = {
        type: FileType.IMAGE,
        dest: FilesystemResource.CHATS.Image(),
        newFileName: function (file: any){
            return 'chat-' + randomString(30) + path.extname(file.originalname)
        }
    }
    return wrapUpload(fileUploader.single('image', config))
}

function checkAndFormatBody(): Middleware {
    return async function (req, res, next) {
        const body = req.body
        const user_id = req.params.id

        const _body: any = { info: {} }

        try {
            _body.users = _.uniqBy(decodeToArray(body.users), 'user')
            if(!_body.users.every(i => i.user))
                return next({ status: 400, description: 'Elements of \'Users\' must be of the form : { user: string, role?: string }' })

            if(!_body.users.every(i => i.user == RBAC.Role.ADMIN)) await existById(User, _body.users.map(c => c.user))

        } catch (e){
            if(Array.isArray(e)) return next({ status: 404, description: 'Users [' + e + '] are not founds.' })
            else return next({ status: 400, description: 'users must be array and have at least one element.' })
        }

        if(req.file) _body.info.img = req.file.filename
        if(body.name) _body.info.name = body.name
        if(body.message) _body.messages = body.message ? [new Message({ content: body.message, sender: user_id })] : undefined

        const me = _body.users.find(u => u.user === user_id)

        if(_body.users.length === 1 && me)
            return next({ status: 400, description: '\'Users\' must contain at least one user different from ' + user_id })

        _body.info.type = body.type || ( (_body.info.name || _body.users.length + (me ? 0 : 1) > 2 ) ? IChat.Type.GROUP: IChat.Type.ONE )

        if(IChat.Type.isGroupChat(_body.info.type) && !_body.info.name)
            return next({ status: 400, description: 'A group chat must have a name' })

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
            default:
                return next({ status: 400, description: 'Required \'type\' in ' + IChat.Type.values() })
        }
        console.debug('Create Chat Body = ', _body)

        req.locals.body = _body
        next()
    }
}

export function create(): Middlewares {
    return [
        checkRequestHeaders({'content-type': 'multipart/form-data'}),
        checkRestrictedRBAC({
            operation: Operation.CREATE,
            resource: Resource.CHAT,
            others: (decodedToken, param_id) => decodedToken._id !== param_id
        }),
        // Check parameters, queries of request
        function (req, res, next){
            const {id} = req.params
            if(!ObjectId.isValid(id)) return next({ status: 400, description: 'Required a valid \'id\''})
            next()
        },
        uploadChatImage(),
        checkAndFormatBody()
    ]
}

export function list(): Middlewares {
    return [
        checkRestrictedRBAC({
            operation: Operation.RETRIEVE,
            resource: Resource.CHAT,
            others:  (decodedToken, param_id) => decodedToken._id !== param_id
        }),
        // Check parameters, queries of request
        function (req, res, next){
            const {id} = req.params
            if(!ObjectId.isValid(id)) return next({ status: 400, description: 'Required a valid \'id\''})

            let noMessages = req.query['no-messages']
            if(noMessages){
                try {
                    req.locals.noMessages = decodeToBoolean(noMessages)
                }
                catch (e){
                    return next({ status: 400, description: 'Query parameter \'no-messages\' must be a boolean.'})
                }
            }

            const searchAvailableValue = ['partial', 'full']
            let  {name} = req.query
            if(name) {
                try {
                    name = JSON.parse(name)
                    if(!name.search || !name.value) throw new Error()
                } catch (e) {
                    return next({ status: 400, description: 'Parameter \'name\' is malformed. It must be of form: {"search": string, "value": string}' })
                }
                if(!searchAvailableValue.includes(name.search)) return next({ status: 400, description: `Parameter \'name.search\' must be in ${searchAvailableValue}.` })
            }

            const user = req.locals.user
            const pipelinePopulatedChat = _.cloneDeep(ChatPopulationPipeline)
            const filtersGroup = { 'info.type': IChat.Type.GROUP, 'users.user': user._id }
            const filtersOne = { 'info.type': IChat.Type.ONE , 'users.user': user._id }
            if(name) {
                let regexObject = { $regex: `^${name.value}`, $options: "i" }
                if(name.search === 'full') regexObject['$regex']+='$'
                filtersGroup['info.name'] = regexObject
                Object.assign(pipelinePopulatedChat[0].match, { 'credential.userID' : regexObject })
            }

            req.locals.filters = {
                group: {
                    pipeline: ChatPopulationPipeline,
                    filter: filtersGroup
                },
                one: {
                    pipeline: pipelinePopulatedChat,
                    filter: filtersOne
                },
            }
            console.debug('filters ', JSON.stringify(req.locals.filters, null, 2))
            next()
        }
    ]
}

export function one(): Middlewares {
    return [
        checkRestrictedRBAC({
            operation: Operation.RETRIEVE,
            resource: Resource.CHAT,
            others: (decodedToken, param_id) => decodedToken._id !== param_id
        }),
        // Check parameters, queries of request
        function (req, res, next){
            const {id, chatID} = req.params
            if(!ObjectId.isValid(id)) return next({ status: 400, description: 'Required a valid \'id\''})
            if(!ObjectId.isValid(chatID)) return next({ status: 400, description: 'Required a valid \'chatID\''})
            let noMessages = req.query['no-messages']
            if(noMessages){
                try {
                    req.locals.noMessages = decodeToBoolean(noMessages)
                    next()
                }
                catch (e){
                    return next({ status: 400, description: 'Query parameter \'no-messages\' must be a boolean.'})
                }
            }
        }
    ]
}

export function erase(): Middlewares {
    return [
        checkRestrictedRBAC({
            operation: Operation.DELETE,
            resource: Resource.CHAT,
            others: (decodedToken, param_id) => decodedToken._id !== param_id
        }),
        // Check parameters, queries of request
        function (req, res, next){
            const {id, chatID} = req.params
            if(!ObjectId.isValid(id)) return next({ status: 400, description: 'Required a valid \'id\''})
            if(!ObjectId.isValid(chatID)) return next({ status: 400, description: 'Required a valid \'chatID\''})
            next()
        }
    ]
}

export function update(): Middlewares {
    return [
        function (req, res, next){
            let {action} = req.query
            checkRequestHeaders({'content-type': UpdateAction.isUpdateImageAction(action) ? 'multipart/form-data': 'application/json'})(req, res, next)
        },
        checkRestrictedRBAC({
            operation: Operation.UPDATE,
            resource: Resource.CHAT,
            others: (decodedToken, param_id) => decodedToken._id !== param_id
        }),
        // Check parameters, queries of request
        function (req, res, next){
            const {id, chatID} = req.params
            if(!ObjectId.isValid(id)) return next({ status: 400, description: 'Required a valid \'id\''})
            if(!ObjectId.isValid(chatID)) return next({ status: 400, description: 'Required a valid \'chatID\''})

            req.locals.actionsAvailableChatOne = [UpdateAction.UPDATE_USER_ROLE]
            req.locals.actionsAvailableChatGroup = [UpdateAction.UPDATE_CHAT_NAME, UpdateAction.UPDATE_USER_ROLE, UpdateAction.ADD_USERS, UpdateAction.UPDATE_CHAT_IMAGE]

            next()
        }
    ]
}

