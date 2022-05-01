import {decodeToArray} from "../../modules/utilities";
import {Query, Types} from "mongoose";
import {Food, Recipe, User} from "../../models";
import { existById } from '../../database/utils'
import {MongooseDuplicateError, MongooseValidationError} from "../../modules/custom.errors";
import {IPermission} from "../../models/schemas/recipe/permission";
import GrantedType = IPermission.GrantedType;
import {Pagination} from "../../modules/pagination";
import {IRecipe, RecipePopulationPipeline} from "../../models/schemas/recipe";
import {UpdateAction} from "../../middlewares/recipe"
const RecipeType: Array<string> = ['shared', 'saved',  'loved', 'shared-in-chat']

async function getBody(req: any, res: any): Promise<any> {
    console.debug('get RECIPE BODY ... ')
    const recipeBody = {...req.body}

    if(req.files) {
        console.debug(req.files)
        let fileImage = req.files['img']
        if (fileImage && fileImage.length === 1) recipeBody.img = fileImage[0].filename
        let fileVideo = req.files['tutorial']
        if (fileVideo && fileVideo.length === 1) recipeBody.tutorial = fileVideo[0].filename
    }

    if(recipeBody.ingredients) {
        try {
            recipeBody.ingredients = decodeToArray(recipeBody.ingredients)
            if(!recipeBody.ingredients.every(i => i.food && i.quantity)) {
                let message: string = 'Elements of \'Ingredients\' must be of the form : { food: string, quantity: number }'
                res.status(400).json({ description: message })
                return Promise.reject(message)
            }
            await existById(Food, recipeBody.ingredients.map(p => p.food))
        }catch (e){
            if(Array.isArray(e)){
                let message: string = 'Foods [' + e + '] are not founds.'
                res.status(404).json({ description: message })
                return Promise.reject(message)
            } else {
                let message: string = 'Ingredients must be array and have at least one element.'
                res.status(400).json({ description: message })
                return Promise.reject(message)
            }
        }
    }

    delete recipeBody.permission
    delete recipeBody.owner
    delete recipeBody.likes
    delete recipeBody.comments

    console.debug(recipeBody)
    return Promise.resolve(recipeBody)
}


function getFilters(query: any, user?: string): object {

    let {name, countries, diets, categories, ingredients} = query

    let filters = user ? {} : { shared: true }

    if(name) filters['name'] = { $regex: `^${name}`, $options: "i" }
    if(countries) filters['country'] = { $in: countries }
    if(diets) filters['diet'] = { $in: diets }
    if(categories) filters['category'] =  { $in: categories }
    if(ingredients) filters['ingredients.food'] = { $all: ingredients.filter(i => Types.ObjectId.isValid(i)).map(i => Types.ObjectId(i)) }
    // if(ingredients) filters['ingredients.food.name'] = { $all: ingredients } not work

    console.debug(filters)
    return filters
}

function sendPopulatedRecipe(recipe: IRecipe, res: any, status: number){
    recipe.populate(RecipePopulationPipeline, function (err, recipe){
        if(err) return res.status(500).json({description: err.message})
        return res.status(status).json(recipe)
    })
}
export function create_recipe(req, res){
    let {id} = req.params
    if(!Types.ObjectId.isValid(id)) return res.status(400).json({ description: 'Required a valid \'id\''})

    existById(User, [id])
        .then(() => {
            getBody(req, res)
                .then(recipeBody => {
                    recipeBody.owner = req.params.id
                    new Recipe(recipeBody)
                        .save()
                        .then(recipe => sendPopulatedRecipe(recipe, res, 201),
                            err => {
                                if(MongooseValidationError.is(err)) return res.status(400).json({ description: err.message })
                                if(MongooseDuplicateError.is(err)) return res.status(409).json({ description: 'Recipe has been already inserted' })
                                return res.status(500).json({ code: 0, description: err.message })
                            }
                        )

                }, err => console.error(err))
        }, ids => res.status(404).json({description: 'User ('+ids[0]+') is not found.'}))
}

function queryListRecipes(user: string, type: string, filters: object): Query<IRecipe[], IRecipe, {}, IRecipe> {
    switch (type) {
        case 'shared':
            return Recipe.find(filters)
                         .where('owner').equals(user)
                         .where('shared').equals(true)
        case 'saved':
            return Recipe.find(filters)
                         .where('owner').equals(user)
                         .where('shared').equals(false)
        case 'loved':
            return Recipe.find(filters)
                         .where('shared').equals(true)
                         .where('likes.user').equals(Types.ObjectId(user))
                         .select('-permission')
        case 'shared-in-chat':
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
    let {id} = req.params
    let {type, page, limit, skip} = req.query
    if(!Types.ObjectId.isValid(id))  return res.status(400).json({ description: 'Required a valid \'id\''})
    if(type !== undefined && !RecipeType.includes(type))
        return res.status(400).json({description: 'Required \'type\' include in [' + RecipeType + '] or not set'})
    console.debug({...req.params, ...req.query})

    existById(User, [id])
        .then(() => {

            let filters = getFilters(req.query, id)

            let paginationOptions = page && limit ? {page: +page, limit: +limit,  skip: +skip}: undefined

            let promise;

            if(type === "loved"){
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

            promise.then(paginationResult => res.status(200).json(paginationResult), err => res.status(500).json({code: err.code || 0, description: err.message}))

        }, ids => res.status(404).json({description: 'User ('+ids[0]+') is not found.'}))
}

export function one_shared_recipe(req, res){
    let {recipeID} = req.params
    if(!Types.ObjectId.isValid(recipeID))  return res.status(400).json({ description: 'Required a valid \'recipeID\''})

    Recipe.findOne(req.locals && req.locals.filters)
        .where('_id').equals(recipeID)
        .where('shared').equals(true)
        .select('-permission')
        .then(recipe => {
            if(!recipe) return res.status(404).json({description: 'Recipe is not found'})
            return  res.status(200).json(recipe)
        }, err => res.status(500).json({code: err.code || 0, description: err.message}))
}

export function one_recipe(req, res){
    let {id, recipeID} = req.params
    let {type} = req.query

    if(!Types.ObjectId.isValid(id))  return res.status(400).json({ description: 'Required a valid \'id\''})
    if(!Types.ObjectId.isValid(recipeID))  return res.status(400).json({ description: 'Required a valid \'recipeID\''})

    console.debug({...req.params, ...req.query})
    switch (type){
        case 'shared':
            one_shared_recipe(req, res)
            break
        default: {
            let query: Query<IRecipe, IRecipe, {}, IRecipe> = null
            switch (type){
                case 'saved':
                    query = Recipe.findOne()
                        .where('_id').equals(recipeID)
                        .where('owner').equals(id)
                        .where('shared').equals(false)
                    break
                case 'loved':
                    query = Recipe.findOne()
                        .where('_id').equals(recipeID)
                        .where('shared').equals(true)
                        .where('likes.user').equals(Types.ObjectId(id))
                        .select('-permission')
                    break
                case 'shared-in-chat':
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
    let {id, recipeID} = req.params
    if(!Types.ObjectId.isValid(id)) return res.status(400).json({ description: 'Required a valid \'id\''})
    if(!Types.ObjectId.isValid(recipeID)) return res.status(400).json({ description: 'Required a valid \'recipeID\''})

    const decodedToken = req.locals.user

    getBody(req, res)
        .then(updated => {
            if(Object.keys(updated).length === 0) return res.status(400).json({
                description: 'Required body have to contain: '+
                    'img?: string, tutorial?: string, '+
                    'name?: string, ingredients?: array, preparation?: string note?: string, '+
                    'shared?: boolean, country?: string, category?: string, diet?: string'
            })
            Recipe.findOne()
                .where('_id').equals(recipeID)
                .where('owner').equals(id)
                .then(doc => {
                    if(!doc) return res.status(404).json({description: 'Recipe is not found'})

                    if(!(decodedToken._id == doc.owner._id || doc.permission.find(p => p.user._id == decodedToken._id && GrantedType.isWritePermission(p.granted))))
                        return res.status(403).json({description: 'User is not allowed to update this resource'})

                    updated.updatedAt = Date.now()
                    let newDoc = new Recipe(Object.assign(doc, updated))
                    newDoc.save()
                        .then(_doc => sendPopulatedRecipe(_doc, res, 200),
                            err => {
                                if(MongooseValidationError.is(err)) return res.status(400).json({ description: err.message })
                                if(MongooseDuplicateError.is(err)) return res.status(409).json({ description: "Shared recipe already exists with this name" })
                                return res.status(500).json({code: err.code || 0, description: err.message})
                            })
                }, err => res.status(500).json({code: err.code || 0, description: err.message}))
        }, err => console.error(err))
}

function update_permission_recipe(req, res){
    const {id, recipeID} = req.params
    if(!Types.ObjectId.isValid(id)) return res.status(400).json({ description: 'Required a valid \'id\''})
    if(!Types.ObjectId.isValid(recipeID)) return res.status(400).json({ description: 'Required a valid \'recipeID\''})

    const err_ms_empty = "Permission must be array and have at least one element"
    const permission = req.body.permission

    if(!permission) return res.status(400).json({ description:  err_ms_empty })
    const _availableGranted = IPermission.GrantedType.values().map(g => g.toString())
    _availableGranted.push('revoke')
    if(!permission.every(p => p.user)) return res.status(400).json({ description: 'Elements of \'Permission\' must be of the form : { user: string, granted?: string } with granted in ' + _availableGranted })

    console.debug(permission)

    existById(User, permission.map(p => p.user))
        .then(() => {
            const decodedToken = req.locals.user

            Recipe.findOne()
                .where('_id').equals(recipeID)
                .then(recipe => {

                    if(!recipe) return res.status(404).json({description: 'Recipe is not found'})
                    if(!(decodedToken._id == recipe.owner._id || recipe.permission.find(p => p.user._id == decodedToken._id && GrantedType.isRootPermission(p.granted))))
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

        }, err => {
            if(Array.isArray(err)) res.status(404).json({description: 'Users [' + err +'] are not founds.'})
            else res.status(400).json({ description: err_ms_empty })
        })
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
    let {id, recipeID} = req.params
    if(!Types.ObjectId.isValid(id))  return res.status(400).json({ description: 'Required a valid \'id\''})
    if(!Types.ObjectId.isValid(recipeID))  return res.status(400).json({ description: 'Required a valid \'recipeID\''})

    const decodedToken = req.locals.user
    Recipe.findOne()
        .where('_id').equals(recipeID)
        .then(recipe =>{
            if(!recipe) return res.status(404).json({description: 'Recipe is not found'})

            if(!(decodedToken._id == recipe.owner._id || recipe.permission.find(p => p.user._id == decodedToken._id && GrantedType.isRootPermission(p.granted))))
                return res.status(403).json({description: 'User is not allowed to delete this resource'})

            recipe.remove()
                .then(doc => res.status(200).json({description: 'Recipe has been deleted', deletedDoc: doc}),
                    err => res.status(500).json({code: err.code || 0, description: err.message}) )

        }, err => res.status(500).json({code: err.code || 0, description: err.message}))
}

export function list_all_recipes(req, res){

    let {page, limit, skip} = req.query

    let filters = getFilters(req.query)
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
