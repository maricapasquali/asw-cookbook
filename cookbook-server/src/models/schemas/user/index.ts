import {
    Document,
    Schema
} from "mongoose"
import { RBAC } from "../../../libs/rbac"
import {
    Countries,
    Genders
} from "cookbook-shared/assets"
import { valuesOfEnum } from "../../../libs/utilities"
import Role = RBAC.Role

export interface IUser extends Document{
    signup: string
    createdAt: number
    information: {
        img?:string
        firstname:string
        lastname:string
        email: string
        tel_number?:string
        birth_date?:string
        gender?:string
        country?:string
        occupation?:string
    }
    credential:{
        userID:string
        hash_password: string
        role: string
        lastAccess: number
    }
    strike?:number
}
export namespace IUser {
    export function isAlreadyLoggedOut(user: IUser): boolean {
        return user.credential.lastAccess && user.credential.lastAccess !== 0
    }
}

export namespace SignUp {
    export enum State {
        PENDING = "pending", CHECKED = "checked"
    }
    export namespace State {
        export function values(): State[] {
            return valuesOfEnum(State, "string")
        }
        export function _default(role: string) {
            return Role.isAdmin(role) ? State.CHECKED : State.PENDING
        }

        export function isChecked(state: string) {
            return state as State === State.CHECKED
        }

        export function isPending(state: string) {
            return state as State === State.PENDING
        }
    }
}

export namespace Strike {
    export const MAX = 3
    export function isBlocked(strike: number): boolean {
        return strike >= Strike.MAX
    }
}

export const UserSchema: Schema<IUser> = new Schema<IUser>({
    signup: {
        type: String,
        required: false,
        default: function () {
            return SignUp.State._default(this.credential.role)
        },
        enum: SignUp.State.values()
    },
    createdAt: { type: Number, required: false, default: () => Date.now() },
    information: {
        img: {
            type: String,
            required: false,
            default: null
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
            match: [EmailValidator.regex, "Please fill a valid email address"],
            unique: true
        },
        tel_number: {
            type: String,
            required: false
        },
        birth_date: {
            type: String,
            required: false
        },
        gender: {
            type: String,
            required: false,
            enum: Genders.map(gender => gender.value)
        },
        country: {
            type: String,
            required: false,
            enum: Countries.map(country => country.value)
        },
        occupation: {
            type: String,
            required: false
        }
    },
    credential: {
        userID: {
            type: String,
            required: true,
            unique: true
        },
        hash_password: {
            type: String,
            required: true
        },
        role: {
            type: String,
            required: false,
            default: Role.SIGNED,
            enum: Role.values()
        },
        lastAccess: { type: Number, required: false, default: undefined }
    },
    strike: {
        type: Number,
        required: false,
        default: function () {
            return Role.isSigned(this.credential.role) ? 0 : undefined
        },
        minimum: 0,
        maximum: Strike.MAX
    }
})

UserSchema.index({ "information.email": 1, "credential.role": 1 }, { unique: true, name: "role-email" })
