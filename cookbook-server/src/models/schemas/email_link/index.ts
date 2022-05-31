import {Schema} from "mongoose";

export interface IEmailLink {
    userID: string
    email: string
    expired: number
    link: string
    randomKey: string
}

export const EmailLinkSchema: Schema<IEmailLink> = new Schema<IEmailLink>({
    userID: {type: String, required: true},
    email: {type: String, required: true},
    expired:  {type: Number, required: true},
    link:  {type: String, required: true},
    randomKey:  {type: String, required: true}
})