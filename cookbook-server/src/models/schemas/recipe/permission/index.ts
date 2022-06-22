import {
    Document,
    Schema
} from "mongoose"

import { IUser } from "../../user"
import { valuesOfEnum } from "../../../../libs/utilities"

export interface IPermission extends Document {
    user: IUser["_id"]
    granted: string
}
export namespace IPermission {
    export enum GrantedType {
        READ = "read", // retrieve
        WRITE = "read-write", // retrieve & update
        ROOT = "root" // retrieve & update & delete
    }
    export namespace GrantedType {
        export function values(): GrantedType[] {
            return valuesOfEnum(GrantedType, "string")
        }
        export function isWritePermission(value: string): boolean {
            const granted: GrantedType = value as GrantedType
            return granted === GrantedType.WRITE || granted === GrantedType.ROOT
        }
        export function isRootPermission(value: string): boolean {
            return value as GrantedType === GrantedType.ROOT
        }
    }
}

export const PermissionSchema: Schema<IPermission> = new Schema<IPermission>({
    _id: false,
    user: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    granted: { type: String, required: false, enum: IPermission.GrantedType.values(), default: IPermission.GrantedType.READ }
})
