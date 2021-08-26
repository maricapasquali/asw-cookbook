import {model, Model} from 'mongoose'
import {UserSchema, IUser} from './schemas/user'
import {EmailLinkSchema, IEmailLink} from './schemas/email_link'

export const User: Model<IUser> = model<IUser>('User', UserSchema)
export const EmailLink: Model<IEmailLink> = model<IEmailLink>('EmailLink', EmailLinkSchema)

//TODO: ADD OTHER SCHEMAS
