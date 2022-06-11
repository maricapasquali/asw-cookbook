import {Schema, Document} from "mongoose";
import {IUser} from "../index";

export interface IFriend extends Document {
    from: IUser['_id'],
    to: IUser['_id'],
    state?: string ,
    createdAt?: number,
    updatedAt?: number
}

export namespace FriendShip {
    export enum State {
        PENDING = 'pending', ACCEPTED = 'accepted', REJECTED = 'rejected'
    }

    export namespace State {
        export function values(): Array<State> {
            return [State.PENDING, State.ACCEPTED, State.REJECTED]
        }

        export function changeable(): Array<State>{
            return [State.ACCEPTED, State.REJECTED]
        }

        export function isPending(state: string){
            return state as State === State.PENDING
        }
    }
}

export const FriendSchema: Schema<IFriend> = new Schema<IFriend>({
    from: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    to: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    state: { type: String, required: false, default: FriendShip.State.PENDING, enum: FriendShip.State.values() } ,
    createdAt: { type: Number, required: false, default: Date.now() },
    updatedAt: { type: Number, required: false, default: Date.now() }
})

FriendSchema.index({ from: 1, to: 1 }, {unique: true, name: 'friend-ship'})

export const FriendShipPopulateOptions = {
    path: 'from to',
    select: {
        userID: '$credential.userID',
        img: '$information.img',
        country: '$information.country',
        occupation: '$information.occupation',
    },
    match: {}
}