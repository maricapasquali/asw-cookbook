import {Query, Types} from "mongoose";
import {Recipe} from "../../models";
import {MongooseDuplicateError, MongooseValidationError} from "../../libs/custom.errors";
import {IPermission} from "../../models/schemas/recipe/permission";
import GrantedType = IPermission.GrantedType;
import {Pagination} from "../../libs/pagination";
import {IRecipe, RecipePopulationPipeline} from "../../models/schemas/recipe";
import {RecipeType, UpdateAction} from "../../middlewares/recipe"

function sendPopulatedRecipe(recipe: IRecipe, res: any, status: number): void {
    recipe.populate(RecipePopulationPipeline, function (err, recipe){
        if(err) return res.status(500).json({description: err.message})
        return res.status(status).json(recipe)
    })
}

export function create_recipe(req, res){
    new Recipe(req.body)
        .save()
        .then(recipe => sendPopulatedRecipe(recipe, res, 201),
            err => {
                if(MongooseValidationError.is(err)) return res.status(400).json({ description: err.message })
                if(MongooseDuplicateError.is(err)) return res.status(409).json({ description: 'Recipe has been already inserted' })
                return res.status(500).json({ code: 0, description: err.message })
            }
        )
}

function queryListRecipes(user: string, type: string, filters: object): Query<IRecipe[], IRecipe, {}, IRecipe> {
    switch (type as RecipeType) {
        case RecipeType.SHARED:
            return Recipe.find(filters)
                         .where('owner').equals(user)
                         .where('shared').equals(true)
        case RecipeType.SAVED:
            return Recipe.find(filters)
                         .where('owner').equals(user)
                         .where('shared').equals(false)
        case RecipeType.LOVED:
            return Recipe.find(filters)
                         .where('shared').equals(true)
                         .where('likes.user').equals(Types.ObjectId(user))
                         .select('-permission')
        case RecipeType.SHARED_IN_CHAT:
            return Recipe.find(filters)
                         .where('permission.user').equals(user)
                         .where('owner').ne(user)
        default: {
            filters['$or'] = [{ 'owner': user }, { 'permission.user': user }]
            return Recipe.find(filters)
        }

    }
}
export function list_recipes(req, res){
    const filters = req.locals.filters
    const {id} = req.params
    const {type, page, limit, skip} = req.query
    const paginationOptions = page && limit ? {page: +page, limit: +limit,  skip: +skip}: undefined

    let promise;

    if(RecipeType.isLoved(type)){
        let timestampMyLike = (recipe: IRecipe) => recipe.likes.find(l => l.user?._id == id)?.timestamp

        promise = queryListRecipes(id, type, filters)
            .then((likesRecipes) => {
                likesRecipes.sort((l1, l2) => timestampMyLike(l2) - timestampMyLike(l1)) // descending sort
                return Promise.resolve(Pagination.ofArray(likesRecipes, paginationOptions))
            }, err => Promise.reject(err))
    } else {
        promise = Pagination.ofQueryDocument(
            queryListRecipes(id, type, filters).sort({ updatedAt: -1 }),
            paginationOptions
        )
    }

    promise.then(paginationResult => res.status(200).json(paginationResult),
                 err => res.status(500).json({code: err.code || 0, description: err.message}))

}

export function one_shared_recipe(req, res){
    const {recipeID} = req.params
    Recipe.findOne(req.locals?.filters || {})
        .where('_id').equals(recipeID)
        .where('shared').equals(true)
        .select('-permission')
        .then(recipe => {
            if(!recipe) return res.status(404).json({description: 'Recipe is not found'})
            return  res.status(200).json(recipe)
        }, err => res.status(500).json({code: err.code || 0, description: err.message}))
}

export function one_recipe(req, res){
    const {id, recipeID} = req.params
    const {type} = req.query
    switch (type as RecipeType){
        case RecipeType.SHARED:
            one_shared_recipe(req, res)
            break
        default: {
            let query: Query<IRecipe, IRecipe, {}, IRecipe> = null
            switch (type){
                case RecipeType.SAVED:
                    query = Recipe.findOne()
                        .where('_id').equals(recipeID)
                        .where('owner').equals(id)
                        .where('shared').equals(false)
                    break
                case RecipeType.LOVED:
                    query = Recipe.findOne()
                        .where('_id').equals(recipeID)
                        .where('shared').equals(true)
                        .where('likes.user').equals(Types.ObjectId(id))
                        .select('-permission')
                    break
                case RecipeType.SHARED_IN_CHAT:
                    query = Recipe.findOne()
                        .where('_id').equals(recipeID)
                        .where('permission.user').equals(id)
                        .where('owner').ne(id)
                    break
                default: {
                    query = Recipe.findOne()
                        .where('_id').equals(recipeID)
                        .where('permission.user').equals(id)
                }
            }
            query
                .then(recipe => {
                    if(!recipe) return res.status(404).json({description: 'Recipe is not found'})
                    return  res.status(200).json(recipe)
                }, err => res.status(500).json({code: err.code || 0, description: err.message}))
        }
            break;
    }
}

function update_actual_recipe(req, res){
    const {id, recipeID} = req.params
    const body = req.body
    const user = req.locals.user
    Recipe.findOne()
          .where('_id').equals(recipeID)
          .where('owner').equals(id)
          .then(recipe => {
              if(!recipe) return res.status(404).json({description: 'Recipe is not found'})

              if(!(user._id == recipe.owner._id || recipe.permission.find(p => p.user._id == user._id && GrantedType.isWritePermission(p.granted))))
                  return res.status(403).json({description: 'User is not allowed to update this recipe'})

              body.updatedAt = Date.now()
              let updatedRecipe = new Recipe(Object.assign(recipe, body))
              updatedRecipe.save()
                  .then(_doc => sendPopulatedRecipe(_doc, res, 200),
                        err => {
                            if(MongooseValidationError.is(err)) return res.status(400).json({ description: err.message })
                            if(MongooseDuplicateError.is(err)) return res.status(409).json({ description: "Shared recipe already exists with this name" })
                            return res.status(500).json({code: err.code || 0, description: err.message})
                        })
          }, err => res.status(500).json({code: err.code || 0, description: err.message}))
}

function update_permission_recipe(req, res){
    const {recipeID} = req.params
    const permission = req.body.permission
    const user = req.locals.user

    Recipe.findOne()
        .where('_id').equals(recipeID)
        .then(recipe => {

            if(!recipe) return res.status(404).json({description: 'Recipe is not found'})
            if(!(user._id == recipe.owner._id || recipe.permission.find(p => p.user._id == user._id && GrantedType.isRootPermission(p.granted))))
                return res.status(403).json({ description: 'User is not allowed to update permissions.' })

            const _revoke = permission.filter(p => p.granted === 'revoke')
            const _update = permission.filter(p => p.granted !== 'revoke')
            const _unChanged: number[] = []
            const _unRevoked: number[] = []
            console.debug('permission to remove ', JSON.stringify(_revoke))
            console.debug('permission to update ', JSON.stringify(_update))

            _revoke.forEach(p => {
                let index = recipe.permission.findIndex(pp => pp.user._id == p.user)
                if(index !== -1) recipe.permission.splice(index, 1)
                else _unRevoked.push(index)
            })

            _update.map(p => ({ user: p.user, granted: p.granted || IPermission.GrantedType.READ }))
                .forEach(p => {
                    console.debug('permission ', JSON.stringify(permission))
                    let index = recipe.permission.findIndex(pp => pp.user._id == p.user)
                    if(index === -1) recipe.permission.push(p)
                    else if(p.granted != recipe.permission[index].granted) recipe.permission.splice(index, 1, p)
                    else _unChanged.push(index)
                })
            console.debug('_unChanged', _unChanged, ', _unRevoked', _unRevoked)

            if(_unChanged.length === _update.length && _unRevoked.length === _revoke.length) return res.status(204).send()

            recipe.updatedAt = Date.now()
            recipe.save()
                .then(_doc => {
                        _doc.populate(RecipePopulationPipeline, function (err, populateRecipe) {
                            if(err) return res.status(500).json({description: err.message})
                            res.status(200).json({ description: 'Permission has been updated', updatedRecipe: populateRecipe })
                        })
                    },
                    err => {
                        if(MongooseValidationError.is(err)) return res.status(400).json({ description: err.message })
                        return res.status(500).json({ code: err.code || 0, description: err.message })
                    })

        }, err => res.status(500).json({code: err.code || 0, description: err.message}))
}

export function update_recipe(req, res){
    const { field } = req.query
    switch (field as UpdateAction){
        case UpdateAction.PERMISSION:
            return update_permission_recipe(req, res)
        default:
            return update_actual_recipe(req, res)
    }
}

export function delete_recipe(req, res){
    const {recipeID} = req.params
    const decodedToken = req.locals.user
    Recipe.findOne()
        .where('_id').equals(recipeID)
        .then(recipe =>{
            if(!recipe) return res.status(404).json({description: 'Recipe is not found'})

            if(!(decodedToken._id == recipe.owner._id || recipe.permission.find(p => p.user._id == decodedToken._id && GrantedType.isRootPermission(p.granted))))
                return res.status(403).json({description: 'User is not allowed to delete this recipe'})

            recipe.remove()
                .then(doc => res.status(200).json({description: 'Recipe has been deleted', deletedDoc: doc}),
                    err => res.status(500).json({code: err.code || 0, description: err.message}) )

        }, err => res.status(500).json({code: err.code || 0, description: err.message}))
}

export function list_all_recipes(req, res){
    const {page, limit, skip} = req.query
    const filters = req.locals.filters
    Pagination.ofQueryDocument(
        Recipe.find(filters).sort({ updatedAt: -1 }).select('-permission'),
        page && limit ? {page: +page, limit: +limit, skip: +skip}: undefined,
    )
        .then(recipes => res.status(200).json(recipes),
            err => res.status(500).json({code: err.code || 0, description: err.message}))
}

export function numberRecipesForCountry(req, res){
    Recipe.aggregate([
        { $match: { shared: true } },
        { $group: { _id: "$country",  number: { $sum : 1 } } },
        { $project: { country: "$_id", number: 1, _id: 0 } }
    ])
        .then(items => res.status(200).json(items),
            err => res.status(500).json({code: err.code || 0, description: err.message}))
}
