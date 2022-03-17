import {getRestrictedUser} from "../../utils.controller";
import {Chat, Message} from "../../../models";
import {Types} from "mongoose";
import {RBAC} from "../../../modules/rbac";
import * as _ from "lodash"
import ObjectId = Types.ObjectId;
import Operation = RBAC.Operation;
import Subject = RBAC.Subject;
import {ChatPopulationPipeline, ChatPopulationPipelineSelect} from "../../../models/schemas/chat";

export function send_message(req, res) {
    const {id, chatID} = req.params
    if(!ObjectId.isValid(id)) return res.status(400).json({ description: 'Required a valid \'id\''})
    if(!ObjectId.isValid(chatID)) return res.status(400).json({ description: 'Required a valid \'chatID\''})
    const {content, attachment, timestamp} = req.body
    if(!(content || (!content && attachment))) return res.status(400).json({ description: 'Body must be of the form: { content: string, attachment?: string, timestamp?: number  } or { content?: string, attachment: string, timestamp?: number  } '})

    const user = getRestrictedUser(req, res, { operation: Operation.CREATE, subject: Subject.MESSAGE, others: decodedToken => decodedToken._id !== id })
    if(user) {
        const message = new Message({ sender: user._id, content, timestamp, attachment })

        message.validate()
               .then(() => {
                   console.debug('Message ', message)
                   Chat.updateOne({ _id: chatID, 'users.user': ObjectId(user._id) }, { $push: { messages: message }  })
                       .then(result =>{
                           if(result.n === 0)  return res.status(404).json({ description: 'Chat is not found.' })
                           if(result.nModified === 0) return res.status(500).json({ description: 'Message is not send.' })
                           message.populate({path: 'sender' , select: ChatPopulationPipelineSelect}, function (err, populateMessage){
                               if(err) return res.status(500).json({ description: err.message })
                               return res.status(200).json(populateMessage)
                           })
                       }, err => res.status(500).json({ description: err.message }))
               }, err => res.status(400).json({ description: err.message }))

    }
}

export function read_messages(req, res) {
    const {id, chatID} = req.params
    if(!ObjectId.isValid(id)) return res.status(400).json({ description: 'Required a valid \'id\''})
    if(!ObjectId.isValid(chatID)) return res.status(400).json({ description: 'Required a valid \'chatID\''})

    const messages = _.uniq(req.body.messages)
    if(!messages.length) return res.status(400).json({ description: 'Body must be of the form: { messages: [string,...] } '})

    const user = getRestrictedUser(req, res, {operation: Operation.UPDATE, subject: Subject.MESSAGE, others: decodedToken => decodedToken._id != id})
    if(user){
        Chat.findOne()
            .where('_id').equals(chatID)
            .where('users.user').equals(ObjectId(id))
            .then(chat => {
                if(!chat) return res.status(404).json({ description: 'Chat is not found.' })

                const _oldMessages = _.cloneDeep(chat.messages).map(m => ({_id: m._id, read: m.read}))

                const _messagesIDs = _oldMessages.map(m => m._id)
                const messagesNotFound = messages.filter(m => !_messagesIDs.includes(m))
                if(messagesNotFound.length) return res.status(404).json({ description: 'Messages [' + messagesNotFound + '] are not found.' })

                messages.forEach(messageID => {
                    const message = chat.messages.find(m => m._id == messageID)
                    if(message.sender._id != id && !message.read.find(r => r.user && r.user._id == id)) message.read.push({user: id})
                })

                const _newMessages = chat.messages.map(m => ({_id: m._id, read: m.read}))

                if(_.isEqual(_oldMessages,_newMessages)) return res.status(204).send()

                chat.save()
                    .then(_chat => {
                        _chat.populate(ChatPopulationPipeline[1], function (err, populateChatMessages){
                            if(err) return res.status(500).json({ description: err.message })
                            const readers: any = {}
                            populateChatMessages.messages.filter(m => messages.find(messageID => messageID == m._id)).forEach(m => readers[m._id] = m.read.pop())
                            return res.status(200).json({ description: 'Messages [' + messages + '] have been read', readers })
                        })
                    }, err => res.status(500).json({ description: err.message }))

            }, err => res.status(500).json({ description: err.message }))
    }
}

export function list_messages(req, res) { res.status(501).json('List of Messages') }

export function one_message(req, res) { res.status(501).json('GET Message') }
export function change_content_message(req, res) { res.status(501).json('Message content has changed') }
export function delete_message(req, res) { res.status(501).json('Message content has deleted') }
