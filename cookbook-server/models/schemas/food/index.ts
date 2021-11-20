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
    owner: {
        user: IUser['_id'],
        timestamp: number
    }
}


export const FoodSchema: Schema<IFood> = new Schema<IFood>({
    img: { type: String, required: false },
    barcode: { type: String, required: false },

    name: { type: String, required: true },
    nutritional_values: {
        energy: {type: Number, required: true },
        protein: {type: Number, required: false },
        carbohydrates: {
            type: {
                complex: {type: Number, required: false },
                sugar: {type: Number, required: false },
            },
            required: false
        },
        fat: {
            type: {
                unsaturated: {type: Number, required: false },
                saturated: {type: Number, required: false },
            },
            required: false
        },
        salt: {type: Number, required: false },
    },

    owner: {
        user: { type: Schema.Types.ObjectId, required: true },
        timestamp: { type: Number, required: false, default: Date.now() },
    }

})