import {model, Model} from 'mongoose'
import {UserSchema, IUser} from './schemas/user'
import {EmailLinkSchema, IEmailLink} from './schemas/email_link'


import {FoodSchema, IFood} from "./schemas/food";
import {ShoppingListPointSchema, IShoppingListPoint} from "./schemas/shopping-list-point";
import {RecipeSchema, IRecipe} from "./schemas/recipe";
import {LikeSchema, ILike} from "./schemas/recipe/like";
import {CommentSchema, IComment} from "./schemas/recipe/comment";
import {ResponseSchema, IResponse} from "./schemas/recipe/comment/response";

export const User: Model<IUser> = model<IUser>('User', UserSchema)
export const EmailLink: Model<IEmailLink> = model<IEmailLink>('EmailLink', EmailLinkSchema)

export const Food: Model<IFood> = model<IFood>('Food', FoodSchema)
export const ShoppingListPoint: Model<IShoppingListPoint> = model<IShoppingListPoint>('ShoppingListPoint', ShoppingListPointSchema)
export const Recipe: Model<IRecipe> = model<IRecipe>('Recipe', RecipeSchema)
export const Like: Model<ILike> = model<ILike>('Like', LikeSchema)
export const Comment: Model<IComment> = model<IComment>('Comment', CommentSchema)
export const CommentResponse: Model<IResponse> = model<IResponse>('CommentResponse', ResponseSchema)

//TODO: ADD OTHER SCHEMAS
