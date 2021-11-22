import {Schema, Document} from "mongoose";
import {IUser} from "../user";
import {IShoppingListPoint, ShoppingListPointSchema} from "./point";

import {MongooseDuplicateError} from "../../../modules/custom.errors";

export interface IShoppingList extends Document {
    user: IUser['_id'],
    shoppingList: [IShoppingListPoint]
}

export const ShoppingListSchema: Schema<IShoppingList> = new Schema<IShoppingList>({
    user: { type: Schema.Types.ObjectId, required: true, unique: true, ref: 'User' },
    shoppingList: { type: [ShoppingListPointSchema], required: false, default: [] }
})

ShoppingListSchema.pre('save', function (){
    if(new Set(this.shoppingList.map(p => p.food.toString())).size < this.shoppingList.length)
        throw new MongooseDuplicateError('duplicate food on shopping list')
})