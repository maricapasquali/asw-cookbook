import {Document, Schema} from "mongoose";
import {IUser} from "../../../user";

export interface IReport extends Document {
    user?: IUser['_id'],
    timestamp: number
}

export const ReportSchema: Schema<IReport> = new Schema<IReport>({
    user: { type: Schema.Types.ObjectId, default: undefined, required: false, ref: 'User' },
    timestamp: { type: Number, required: true, default: Date.now() },
})