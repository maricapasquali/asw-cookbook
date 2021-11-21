import {Schema, Document} from "mongoose";
import {IFood} from "../../food";

export interface IShoppingListPoint extends Document {
    foodID: IFood['_id'],
    checked?: boolean
}

export const ShoppingListPointSchema: Schema<IShoppingListPoint> = new Schema<IShoppingListPoint>({
    foodID: { type: Schema.Types.ObjectId, required: true, ref: 'Food' },
    checked: { type: Boolean, required: false, default: false },
})