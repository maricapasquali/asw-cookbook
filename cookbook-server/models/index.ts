import {model, Model} from 'mongoose'
import {UserSchema, IUser} from './schemas/user'
import {FriendSchema, IFriend} from "./schemas/user/friend";
import {EmailLinkSchema, IEmailLink} from './schemas/email_link'


import {FoodSchema, IFood} from "./schemas/food";
import {ShoppingListSchema, IShoppingList} from "./schemas/shopping-list";
import {RecipeSchema, IRecipe} from "./schemas/recipe";
import {LikeSchema, ILike} from "./schemas/recipe/like";
import {CommentSchema, IComment} from "./schemas/recipe/comment";
import {ReportSchema, IReport} from "./schemas/recipe/comment/report";

export const User: Model<IUser> = model<IUser>('User', UserSchema)
export const Friend: Model<IFriend> = model<IFriend>('Friend', FriendSchema)
export const EmailLink: Model<IEmailLink> = model<IEmailLink>('EmailLink', EmailLinkSchema)

export const Food: Model<IFood> = model<IFood>('Food', FoodSchema)
export const ShoppingList: Model<IShoppingList> = model<IShoppingList>('ShoppingList', ShoppingListSchema)
export const Recipe: Model<IRecipe> = model<IRecipe>('Recipe', RecipeSchema)
export const Like: Model<ILike> = model<ILike>('Like', LikeSchema)
export const Comment: Model<IComment> = model<IComment>('Comment', CommentSchema)
export const Report: Model<IReport> = model<IReport>('Report', ReportSchema)
//TODO: ADD OTHER SCHEMAS
