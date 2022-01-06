import {Document, Schema} from "mongoose";
import {IUser} from "../../user";
import Types = Schema.Types

export interface IMessage extends Document  {
    sender: IUser['_id']
    content: string
    timestamp: number
    read?: Array<{ user: IUser['_id'], timestamp?: number }>
}

export const MessageSchema: Schema<IMessage> = new Schema<IMessage>({
    sender: { type: Types.ObjectId, required: true, ref: 'User'},
    content: { type: String, required: true },
    timestamp: { type: Number, required: false, default: Date.now() },
    read: {
        type: [{
            _id: false,
            user: { type: Types.ObjectId, required: true, ref: 'User' },
            timestamp: { type: Number, required: false, default: Date.now() },
        }],
        required: false,
        default: []
    },
})