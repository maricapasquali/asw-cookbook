import {
    Document,
    Schema
} from "mongoose"
import { IFood } from "../../food"

export interface IShoppingListPoint extends Document {
    food: IFood["_id"]
    checked?: boolean
}

export const ShoppingListPointSchema: Schema<IShoppingListPoint> = new Schema<IShoppingListPoint>({
    food: { type: Schema.Types.ObjectId, required: true, ref: "Food" },
    checked: { type: Boolean, required: false, default: false }
})
