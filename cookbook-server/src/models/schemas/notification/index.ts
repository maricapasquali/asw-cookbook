import {Document, Schema} from "mongoose";
import {IUser} from "../user";
import {RBAC} from "../../../libs/rbac";
import Role = RBAC.Role;
import {Types} from "mongoose"

export interface INotification extends Document {
    user: IUser['_id'] | 'admin'
    type: string
    content: string
    timestamp?: number
    read?: boolean
    otherInfo?: object
}

export namespace Notification {
    export enum Type {
        FRIENDSHIP = 'friendship',
        RECIPE = 'recipe',
        COMMENT = 'comment',
        LIKE = 'like',
        FOOD = 'food',
        USER_INFO = 'user-info',
        REPORT = 'report',
        STRIKE = 'strike'
    }
    export namespace Type {
        export function values(): Array<Notification.Type> {
            return Object.entries(Notification.Type)
                         .filter(([k, v]) => typeof v === 'string')
                         .map(([k, v]) => Notification.Type[k])
        }
    }
}

export const NotificationSchema: Schema<INotification> = new Schema<INotification>({
    user: {
        type: Schema.Types.Mixed,
        required: true,
        validate: function (){
            return Role.isAdmin(this.user) || Types.ObjectId.isValid(this.user)
        }
    },
    type: { type: String, required: true, enum: Notification.Type.values() },
    content: { type: String, required: true },
    timestamp: { type: Number, required: false, default: Date.now() },
    read: { type: Boolean, required: false, default: false },
    otherInfo: {type: Schema.Types.Mixed, required: false, default: false}
})
