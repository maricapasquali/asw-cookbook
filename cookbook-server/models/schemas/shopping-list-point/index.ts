import {Schema, Document} from "mongoose";
import {IUser} from "../user";
import {IFood} from "../food";

export interface IShoppingListPoint extends Document {
    user: IUser['_id'],
    foodID: IFood['_id'],
    checked?: boolean
}

export const ShoppingListPointSchema: Schema<IShoppingListPoint> = new Schema<IShoppingListPoint>({
    user: { type: Schema.Types.ObjectId, required: true },
    foodID: { type: Schema.Types.ObjectId, required: true },
    checked: { type: Boolean, required: false, default: false },
})