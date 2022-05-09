import {Schema, Document} from "mongoose";
import {IUser} from "../user";

export interface IFood extends Document {
    img?: string,
    barcode?: string,
    name: string,
    nutritional_values: {
        energy: number,
        protein?: number,
        carbohydrates?: {
            complex: number,
            sugar: number
        },
        fat?: {
            unsaturated: number,
            saturated: number
        },
        salt?: number
    },
    owner: IUser['_id'],
    createdAt?: number
}


export const FoodSchema: Schema<IFood> = new Schema<IFood>({
    img: { type: String, required: false },
    barcode: { type: String, required: false },

    name: { type: String, required: true, unique: true },
    nutritional_values: {
        energy: {type: Number, required: true },
        protein: {type: Number, required: false , default: 0},
        carbohydrates: {
            complex: {type: Number, required: false, default: 0  },
            sugar: {type: Number, required: false, default: 0 },
        },
        fat: {
            unsaturated: {type: Number, required: false, default: 0 },
            saturated: {type: Number, required: false, default: 0  },
        },
        salt: {type: Number, required: false, default: 0 },
    },
    owner: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    createdAt: { type: Number, required: false, default: Date.now() },
})

FoodSchema.pre(['find', 'findOne'], function() {
    this.populate({
        path: 'owner',
        select: { 'userID' : '$credential.userID', 'role': '$credential.role' }
    })
});