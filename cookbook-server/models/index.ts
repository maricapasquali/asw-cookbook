import {model, Model} from 'mongoose'
import {UserSchema, IUser} from './schemas/user'

export const User: Model<IUser> = model<IUser>('User', UserSchema)

//TODO: ADD OTHER SCHEMAS
