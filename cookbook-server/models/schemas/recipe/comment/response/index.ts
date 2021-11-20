import {Document, Schema} from "mongoose";

import {IUser} from "../../../user";

import {ILike, LikeSchema} from "../../like";

export interface IResponse extends Document {
    user_owner_recipe: IUser['_id'],
    timestamp: number,
    content: string,
    reported?: boolean,
    likes?: Array<ILike>,
}

export const ResponseSchema: Schema<IResponse> = new Schema<IResponse>({
    user_owner_recipe: { type: Schema.Types.ObjectId, required: true },
    timestamp: { type: Number, required: false, default: Date.now()},
    content: { type: String, required: true },
    reported: { type: Boolean, required: false, default: false},
    likes: { type: [LikeSchema], required: false, default: [] },
})