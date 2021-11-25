import {Schema, Document} from "mongoose";
import {IUser} from "../user";
import {IFood} from "../food";

import {ILike, LikeSchema} from "./like";
import {IComment, CommentSchema} from "./comment";

export interface IRecipe extends Document {
    owner: IUser['_id'],
    name: string,
    ingredients: [{
        food: IFood['_id'],
        quantity: number
    }],
    preparation: string,
    shared: boolean,
    permission: [{
        user: IUser['_id'],
        granted: string
    }],
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

export namespace IRecipe {
    export enum GrantedType {
        READ = 'read', // retrieve
        WRITE = 'read-write', // retrieve & update
        ROOT = 'root' // retrieve & update & delete
    }
    export namespace GrantedType {
        export function values(): Array<GrantedType> {
            return [GrantedType.READ, GrantedType.WRITE, GrantedType.ROOT]
        }
        export function isWritePermission(value: string): boolean {
            let granted: GrantedType = value as GrantedType
            return granted === GrantedType.WRITE || granted === GrantedType.ROOT
        }
        export function isRootPermission(value: string): boolean {
            return value as GrantedType === GrantedType.ROOT
        }
    }
}

export const RecipeSchema: Schema<IRecipe> = new Schema<IRecipe>({
    owner: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    name: { type: String, required: true },
    ingredients: {
        type: [{
            food: { type: Schema.Types.ObjectId, required: true, ref: 'Food' },
            quantity: { type: Number, required: true }
        }],
        validate: [function (){ return this.ingredients.length > 0 }, 'Ingredients must be at least one item : {food: string, quantity: number}'],
        required: true
    },
    preparation: { type: String, required: true },
    shared: { type: Boolean, required: false, default: false },
    permission: {
        type: [{
            _id: false,
            user: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
            granted: { type: String, required: false, enum: IRecipe.GrantedType.values(), default: IRecipe.GrantedType.READ }
        }],
        required: false,
        default: function (){
            return [{user: this.owner, granted: IRecipe.GrantedType.ROOT }]
        }
    },
    createdAt: { type: Number, required: false, default: Date.now()},
    updatedAt: { type: Number, required: false, default: Date.now()},
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

RecipeSchema.index({owner: 1, name: 1, shared: 1}, { unique: true, name: 'unique-recipe-for-user' })
RecipeSchema.index({'permission.user': 1, 'permission.granted': 1}, { unique: true, name: 'unique-permission-for-user' })

RecipeSchema.pre(['find', 'findOne'], function() {
    this.populate({ path: 'owner permission.user likes.user comments.user', select: '_id credential.userID' })
    this.populate({ path: 'ingredients.food', select: '_id name -owner' })
});

RecipeSchema.set('toJSON', {
    transform: function (doc, ret, options) {
        const remappingRefUser = (field: any): void => {
            if(field && field.credential) {
                field.userID = field.credential.userID
                delete field.credential
            }
        }
        remappingRefUser(ret.owner)
        ret.permission.forEach(p => remappingRefUser(p.user) )
        ret.likes.forEach(l => remappingRefUser(l.user))
        ret.comments.forEach(c => remappingRefUser(c.user))
        return ret
    }
})