import {Document, Schema} from "mongoose";
import {IUser} from "../../user";

export interface ILike extends Document {
    user: IUser['_id'] | string,
    timestamp: number
}

export const LikeSchema: Schema<ILike> = new Schema<ILike>({
    user: {
        type: Schema.Types.Mixed , //Schema.Types.ObjectId | String
        default: 'anonymous',
        required: true
    },
    timestamp:{ type: Number, required: false, default: Date.now() },
})