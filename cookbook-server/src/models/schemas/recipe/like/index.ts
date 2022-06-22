import {
    Document,
    Schema
} from "mongoose"
import { IUser } from "../../user"

export interface ILike extends Document {
    user?: IUser["_id"]
    timestamp: number
}

export const LikeSchema: Schema<ILike> = new Schema<ILike>({
    user: { type: Schema.Types.ObjectId, default: undefined, required: false, ref: "User" },
    timestamp: { type: Number, required: true, default: () => Date.now() }
})
