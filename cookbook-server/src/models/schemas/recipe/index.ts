import {Schema, Document} from "mongoose";
import {IUser} from "../user";

import {ILike, LikeSchema} from "./like";
import {IComment} from "./comment";
import {Comment} from "../../index";

import {IPermission, PermissionSchema} from "./permission";
import {IIngredient, IngredientSchema} from "./ingredient";
import GrantedType = IPermission.GrantedType;
import {Countries, Diets, RecipeCategories} from "cookbook-shared/assets";

export interface IRecipe extends Document {
    owner: IUser['_id'],
    name: string,
    ingredients: [IIngredient],
    preparation: string,
    shared: boolean,
    permission: Array<IPermission>,
    createdAt: number,
    updatedAt: number,
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
    owner: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    name: { type: String, required: true },
    ingredients: {
        type: [IngredientSchema],
        validate: [function (){ return this.ingredients.length > 0 }, 'Ingredients must be at least one item : {food: string, quantity: number}'],
        required: true
    },
    preparation: { type: String, required: true },
    shared: { type: Boolean, required: false, default: false },
    permission: {
        type: [PermissionSchema],
        required: false,
        default: function (){
            return [{ user: this.owner, granted: GrantedType.ROOT }]
        }
    },
    createdAt: { type: Number, required: false, default: Date.now()},
    updatedAt: { type: Number, required: false, default: Date.now()},
    category: {
        type: String,
        required: true,
        enum: RecipeCategories.map(category => category.value)
    },

    img: { type: String, required: false },
    tutorial: { type: String, required: false },
    note: { type: String, required: false },
    country: { type: String, required: false, enum: Countries.map(country => country.value) },
    diet: { type: String, required: false, enum: Diets.map(diet => diet.value) },
    likes: { type: [LikeSchema], required: false, default: [] },
    comments: { type: [Schema.Types.ObjectId] , required: false, default: [], ref: 'Comment' },
})

RecipeSchema.index({owner: 1, name: 1, shared: 1}, { unique: true, name: 'unique-recipe-for-user' })

RecipeSchema.pre(['find', 'findOne'], function() {
   this.populate(RecipePopulationPipeline)
});

export const RecipePopulationPipeline = [
    {
        path: 'owner permission.user likes.user comments.likes.user ',
        select: { userID : '$credential.userID', img: '$information.img' }
    },
    {
        path: 'ingredients.food'
    },
    {
        path: 'comments'
    }
]
