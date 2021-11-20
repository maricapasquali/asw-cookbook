import {Document, Schema} from "mongoose";

import {IUser} from "../../user";

import {ILike, LikeSchema} from "../like";

import {IResponse, ResponseSchema} from "./response";

export interface IComment extends Document {
    user: IUser['_id'] | string,
    timestamp: number
    content: string,
    reported?: boolean,
    likes?: Array<ILike>,
    response?: IResponse
}

export const CommentSchema: Schema<IComment> = new Schema<IComment>({
    user: { type: Schema.Types.Mixed, required: true }, //Schema.Types.ObjectId | String
    timestamp: { type: Number, required: false, default: Date.now()},
    content: { type: String, required: true },
    reported: { type: Boolean, required: false, default: false},
    likes:  { type: [LikeSchema], required: false, default: [] },
    response: { type: ResponseSchema, required: false }
})