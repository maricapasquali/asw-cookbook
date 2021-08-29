import {Schema, Document} from "mongoose";
import {EmailValidator} from "../../../../modules/validator";

export interface IUser extends Document{
    signup: string,
    information: {
        img?:string
        firstname:string
        lastname:string
        email: string
        tel_number?:string
        birth_date?:string
        sex?:string
        country?:string
        occupation?:string
    },
    credential:{
        userID:string
        hash_password: string
        role: string
        tokens: {access: string, refresh: string} | number | any
    }
    friends: [{
        user: IUser['_id']
        timestamp: number
        state: string ,
    }]
    strike?:number
}

export const UserSchema: Schema<IUser> = new Schema<IUser>({
    signup: {
      type: String,
      required: false,
      default: 'pending',
      enum: ['pending', 'checked']
    },
    information: {
        img: {
            type: String,
            required: false
        },
        firstname: {
            type: String,
            required: true
        },
        lastname: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true,
            match: [EmailValidator.regex, 'Please fill a valid email address']
        },
        tel_number: {
            type: String,
            required: false
        },
        birth_date: {
            type: String,
            required: false
        },
        sex: {
            type: String,
            required: false,
            enum: ['', 'female', 'male', 'other'],
        },
        country: {
            type: String,
            required: false,
        },
        occupation: {
            type: String,
            required: false,
        }
    },
    credential: {
        userID:{
            type: String,
            required: true,
            unique: true
        },
        hash_password:{
            type: String,
            required: true
        },
        role: {
            type: String,
            required: false,
            default: 'signed',
            enum: ['admin', 'signed'],
        },
        tokens: {
            type: Schema.Types.Mixed, //number | {access: string, refresh: string}
            required: false
        }
    },
    friends: {
        type: [{
            user: { type: Schema.Types.ObjectId, required: true },
            timestamp:{ type: Number, required: false, default: Date.now() },
            state: { type: String, required: true, default: 'pending', enum: ['pending', 'accepted', 'rejected']} ,
        }],
        required: false,
        default: []
    },
    strike: { type: Number, required: false, default: 0, minimum: 0, maximum: 3 }
});