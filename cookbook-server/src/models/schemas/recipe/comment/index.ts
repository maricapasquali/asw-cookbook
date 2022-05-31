import {Document, Schema} from "mongoose";

import {IUser} from "../../user";
import {ILike, LikeSchema} from "../like";
import {IReport, ReportSchema} from "./report";
import {IRecipe} from "../index";

export interface IComment extends Document {
    user: IUser['_id'],
    timestamp: number
    content: string,
    reported?: Array<IReport>,
    likes?: Array<ILike>,
    responses?: Array<IComment>
    recipe: IRecipe['_id']
}

export const CommentSchema: Schema<IComment> = new Schema<IComment>({
    user: { type: Schema.Types.ObjectId, required: false, default: undefined, ref: 'User' },
    timestamp: { type: Number, required: false, default: Date.now()},
    content: { type: String, required: false },
    reported: { type: [ReportSchema], required: false, default: []},
    likes:  { type: [LikeSchema], required: false, default: [] },
    responses: { type: [Schema.Types.ObjectId], required: false, default: [], ref: 'Comment'},
    recipe: { type: Schema.Types.ObjectId, required: true, ref: 'Recipe' },
})

CommentSchema.set('toJSON', {
    transform: function (doc, ret, options){
        if(ret) ret.reported = ret.reported.length > 0
        return ret
    }
})

CommentSchema.pre(['find', 'findOne'], function() {
    this.populate({ path: 'user likes.user', select: { userID : '$credential.userID', img: '$information.img'} })
    this.populate({ path: 'responses' })
});