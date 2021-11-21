import {Schema, Document} from "mongoose";
import {IUser} from "../user";

import {IShoppingListPoint, ShoppingListPointSchema} from "./point";

export interface IShoppingList extends Document {
    user: IUser['_id'],
    shoppingList: [IShoppingListPoint]
}

export const ShoppingListSchema: Schema<IShoppingList> = new Schema<IShoppingList>({
    user: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    shoppingList: { type: [ShoppingListPointSchema] }
})