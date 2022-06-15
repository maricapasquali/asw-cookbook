import {
    Document,
    Schema
} from "mongoose"
import { IFood } from "../../food"

export interface IIngredient extends Document {
    food: IFood["_id"]
    quantity: number
}

export const IngredientSchema: Schema<IIngredient> = new Schema<IIngredient>({
    food: { type: Schema.Types.ObjectId, required: true, ref: "Food" },
    quantity: { type: Number, required: true }
})
