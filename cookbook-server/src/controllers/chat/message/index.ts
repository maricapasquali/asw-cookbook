import {
    Chat,
    Message
} from "../../../models"
import { Types } from "mongoose"
import * as _ from "lodash"
import {
    ChatPopulationPipeline,
    ChatPopulationPipelineSelect
} from "../../../models/schemas/chat"
import ObjectId = Types.ObjectId

export function sendMessage(req, res) {
    const { chatID } = req.params
    const { content, attachment, timestamp } = req.body
    const user = req.locals.user

    const message = new Message({ sender: user._id, content, timestamp, attachment })

    message
        .validate()
        .then(() => {
            console.debug("Message ", message)
            Chat.updateOne({ _id: chatID, "users.user": ObjectId(user._id) }, { $push: { messages: message } })
                .then(result => {
                    if (result.n === 0) return res.status(404).json({ description: "Chat is not found." })
                    if (result.nModified === 0) return res.status(500).json({ description: "Message is not send." })
                    message.populate({ path: "sender", select: ChatPopulationPipelineSelect }, (err, populateMessage) => {
                        if (err) return res.status(500).json({ description: err.message })
                        return res.status(200).json(populateMessage)
                    })
                }, err => res.status(500).json({ description: err.message }))
        }, err => res.status(400).json({ description: err.message }))
}

export function readMessages(req, res) {
    const { id, chatID } = req.params
    const messages = req.locals.messages

    Chat.findOne()
        .where("_id")
        .equals(chatID)
        .where("users.user")
        .equals(ObjectId(id))
        .then(chat => {
            if (!chat) return res.status(404).json({ description: "Chat is not found." })

            const _oldMessages = _.cloneDeep(chat.messages).map(m => ({ _id: m._id, read: m.read }))

            const _messagesIDs = _oldMessages.map(m => m._id)
            const messagesNotFound = messages.filter(m => !_messagesIDs.includes(m))
            if (messagesNotFound.length) return res.status(404).json({ description: "Messages [" + messagesNotFound + "] are not found." })

            messages.forEach(messageID => {
                const message = chat.messages.find(m => m._id == messageID)
                if (message.sender._id != id && !message.read.find(r => r.user && r.user._id == id)) message.read.push({ user: id })
            })

            const _newMessages = chat.messages.map(m => ({ _id: m._id, read: m.read }))

            if (_.isEqual(_oldMessages, _newMessages)) return res.status(204).send()

            chat.save()
                .then(_chat => {
                    _chat.populate(ChatPopulationPipeline[1], (err, populateChatMessages) => {
                        if (err) return res.status(500).json({ description: err.message })
                        const readers: any = {}
                        populateChatMessages
                            .messages
                            .filter(m => messages.find(messageID => messageID == m._id))
                            .forEach(m => {
                                readers[m._id] = m.read.pop()
                            })
                        return res.status(200).json({ description: "Messages [" + messages + "] have been read", readers })
                    })
                }, err => res.status(500).json({ description: err.message }))
        }, err => res.status(500).json({ description: err.message }))
}

export function listMessages(req, res) {
    const { chatID } = req.params
    const user = req.locals.user

    Chat.findOne()
        .where("users.user")
        .equals(ObjectId(user._id))
        .where("_id")
        .equals(chatID)
        .then(chat => {
            if (!chat) return res.status(404).json({ description: "Chat is not found." })
            return res.status(200).json(chat.messages)
        }, err => res.status(500).json({ description: err.message }))
}

export function oneMessage(req, res) {
    res.status(501).json("GET Message")
}
export function changeContentMessage(req, res) {
    res.status(501).json("Message content has changed")
}
export function deleteMessage(req, res) {
    res.status(501).json("Message content has deleted")
}
