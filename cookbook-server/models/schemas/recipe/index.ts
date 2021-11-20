import {Schema, Document} from "mongoose";
import {IUser} from "../user";
import {IFood} from "../food";

import {ILike, LikeSchema} from "./like";
import {IComment, CommentSchema} from "./comment";

export interface IRecipe extends Document {
    owner: IUser['_id'],
    name: string,
    ingredients: [{
        foodID: IFood['_id'],
        quantity: number,
        name?: string
    }],
    preparation: string,
    shared: boolean | Array<string>,
    timestamp: number,
    category: string,

    img?: string,
    tutorial?: string,
    note?: string,
    country?: string,
    diet?: string,
    likes?: Array<ILike>,
    comments?: Array<IComment>
}

export const RecipeSchema: Schema<IRecipe> = new Schema<IRecipe>({
    owner: { type: Schema.Types.ObjectId, required: true },
    name: { type: String, required: true },
    ingredients: [{
        foodID: { type: Schema.Types.ObjectId, required: true },
        quantity: { type: Number, required: true },
        name: { type: String, required: false },
    }],
    preparation: { type: String, required: true },
    shared: { type: Schema.Types.Mixed, required: false, default: false },//boolean | Array<string>,
    timestamp: { type: Number, required: false, default: Date.now()},
    category: {
        type: String,
        required: true,
        enum: ['appetizers', 'first courses', 'second courses', 'desserts', 'drink', 'side dish']
    },

    img: { type: String, required: false },
    tutorial: { type: String, required: false },
    note: { type: String, required: false },
    country: { type: String, required: false },
    diet: { type: String, required: false, enum: ['gluten free', 'lactose free', 'light', 'vegetarian', 'vegan'] },
    likes: { type: [LikeSchema], required: false, default: [] },
    comments: { type: [CommentSchema], required: false, default: [] },
})
