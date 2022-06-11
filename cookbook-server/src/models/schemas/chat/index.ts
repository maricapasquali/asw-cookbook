import {Document, Schema} from "mongoose";
import {IUser} from "../user";
import {IMessage, MessageSchema} from "./message";
import Types = Schema.Types
import {valuesOfEnum} from "../../../libs/utilities";

export interface IChat extends Document {
    info: {
        type: IChat.Type,
        name?: string
        img?: string
    },
    users: Array<{ user: IUser['_id'], role: IChat.Role, enteredAt: number, exitedAt?: number }>
    messages: Array<IMessage>
}
export namespace IChat {
    export enum Type {
       ONE = 'one',
       GROUP = 'group'
    }
    export namespace Type {
        export function values(): Array<IChat.Type>{
            return valuesOfEnum(Type, "string")
        }

        export function isGroupChat(type: string): boolean {
            return type as IChat.Type === Type.GROUP
        }
    }
    export enum Role {
        ADMIN = 'admin',
        WRITER = 'writer',
        READER = 'reader'
    }
    export namespace Role {
        export function values(): Array<IChat.Role>{
            return valuesOfEnum(Role, "string")
        }
        export function isReader(role: string): boolean {
            return role as IChat.Role === Role.READER
        }
        export function isAdmin(role: string): boolean {
            return role as IChat.Role === Role.ADMIN
        }
    }
}

export const ChatSchema: Schema<IChat> = new Schema<IChat>({
    info: {
        type: {
            type: String,
            default: IChat.Type.ONE ,
            required: false ,
            enum: IChat.Type.values()
        },
        name: { type: String, default: undefined , required: false },
        img: { type: String, default: undefined , required: false },
    },
    users: {
        type: [{
            _id: false,
            user: {type: Types.ObjectId, required: true, ref: 'User'},
            role: {type: String, required: false, default: IChat.Role.WRITER, enum: IChat.Role.values()},
            enteredAt: { type: Number, required: false, default: Date.now() },
            exitedAt: { type: Number, required: false, default: undefined },
        }],
        required: true,
        validate: [function (){ return this.users.length > 1 }, 'Chat must be at least 2 users '],
        ref: 'User'
    },
    messages: {
        type: [MessageSchema],
        required: false,
        default: []
    },
}, { toObject: { virtuals: true } })

ChatSchema.virtual('started')
          .get(function() {
                return this.messages.length > 0;
          });

ChatSchema.pre(['findOne'], function() {
    this.populate(ChatPopulationPipeline)
})

export const ChatPopulationPipelineSelect = { userID : '$credential.userID', img: '$information.img', lastAccess: '$credential.lastAccess', role: '$credential.role' }
export const ChatPopulationPipeline = [{
        path: 'users.user',
        select: ChatPopulationPipelineSelect,
        match: {}
    },
    {
        path: 'messages.sender messages.read.user',
        select: ChatPopulationPipelineSelect
    }
]
