import * as path from "path";
import {FileUploader} from "../../modules/uploader";
import {decodeToArray, randomString} from "../../modules/utilities";
import {Document, Query, Types} from "mongoose";
import {Food, Recipe, User} from "../../models";

import {
    checkRequestHeaders,
    existById,
    FileConfigurationImage,
    FileConfigurationVideo,
    fileUploader,
    getRestrictedUser, getUser,
} from '../index'
import {MongooseDuplicateError, MongooseValidationError} from "../../modules/custom.errors";
import {RBAC} from "../../modules/rbac";

import FileType = FileUploader.FileType;
import Operation = RBAC.Operation;
import {IPermission} from "../../models/schemas/recipe/permission";
import GrantedType = IPermission.GrantedType;

import {pagination} from "../index"
import {DecodedTokenType} from "../../modules/jwt.token";
import {IRecipe, RecipePopulationPipeline} from "../../models/schemas/recipe";

const RecipeType: Array<string> = ['shared', 'saved',  'loved', 'shared-in-chat']

function authorized(req, res, options: { operation: RBAC.Operation, others?: (decodedToken: DecodedTokenType) => boolean}): DecodedTokenType | false {
    return getRestrictedUser(req, res, {operation: options.operation, subject: RBAC.Subject.RECIPE, others: options.others})
}

function noAuthorizationForOther(id: string | Types.ObjectId){
    return decodedToken => decodedToken._id != id
}

async function getBody(req: any, res: any): Promise<any> {
    console.log('get RECIPE BODY ... ')
    const recipeBody = {...req.body}

    if(req.files) {
        console.log(req.files)
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

    console.log(recipeBody)
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

    console.log(filters)
    return filters
}


export function uploadImageAndTutorial(){
    let _configurationImage = {
        ...FileConfigurationImage, ...{
            newFileName: function (file: any){
                return 'recipe-' + randomString(30) + path.extname(file.originalname)
            }
        }
    }

    let _configurationVideo = {...FileConfigurationVideo, ...{
            newFileName: function (file: any){
                return 'tutorial-' + randomString(30) + path.extname(file.originalname)
            }
        }}

    return fileUploader.mixed(
        [
            { name: 'img', maxCount: 1, type: FileType.IMAGE },
            { name: 'tutorial', maxCount: 1, type: FileType.VIDEO }
        ],
        [_configurationImage, _configurationVideo])
}

function sendPopulatedRecipe(recipe: IRecipe, res: any, status: number){
    recipe.populate(RecipePopulationPipeline, function (err, recipe){
        if(err) return res.status(500).json({description: err.message})
        return res.status(status).json(recipe)
    })
}
export function create_recipe(req, res){
    if(checkRequestHeaders(req, res, {'content-type': 'multipart/form-data'})){
        let {id} = req.params
        if(!Types.ObjectId.isValid(id)) return res.status(400).json({ description: 'Required a valid \'id\''})

        if(authorized(req, res, {operation: Operation.CREATE, others: noAuthorizationForOther(id) })){
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
    }
}

function queryListRecipes(user: string, type: string, filters: object): Query<Document[], Document, {}, Document> {
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
    let {type, page, limit} = req.query
    if(!Types.ObjectId.isValid(id))  return res.status(400).json({ description: 'Required a valid \'id\''})
    if(type !== undefined && !RecipeType.includes(type))
        return res.status(400).json({description: 'Required \'type\' include in [' + RecipeType + '] or not set'})
    console.debug({...req.params, ...req.query})

    existById(User, [id])
        .then(() => {

            const retrieveRecipes = () => {

                let filters = getFilters(req.query, id)

                pagination(
                    queryListRecipes(id, type, filters).sort({ createdAt: -1 , _id: -1 }),
                    page && limit ? {page: +page, limit: +limit}: undefined
                )
                .then(paginationResult => res.status(200).json(paginationResult),
                      err => res.status(500).json({code: err.code || 0, description: err.message}))
            }

            if(type === 'shared') getUser(req, res).then(user => retrieveRecipes(), err => console.error(err))
            else if(authorized(req, res, {operation: Operation.RETRIEVE, others: noAuthorizationForOther(id) })) retrieveRecipes()

        }, ids => res.status(404).json({description: 'User ('+ids[0]+') is not found.'}))
}

export function one_recipe(req, res){
    let {id, recipeID} = req.params
    let {type} = req.query

    if(!Types.ObjectId.isValid(id))  return res.status(400).json({ description: 'Required a valid \'id\''})
    if(!Types.ObjectId.isValid(recipeID))  return res.status(400).json({ description: 'Required a valid \'recipeID\''})
    if(!RecipeType.includes(type)) return res.status(400).json({description: 'Required \'type\' include in [' + RecipeType + ']'})

    console.debug({...req.params, ...req.query})
    switch (type){
        case 'shared':

            getUser(req, res)
                .then(user => {

                    Recipe.findOne()
                        .where('_id').equals(recipeID)
                        .where('owner').equals(id)
                        .where('shared').equals(true)
                        .then(recipe => {
                            if(!recipe) return res.status(404).json({description: 'Recipe is not found'})
                            return  res.status(200).json(recipe)
                        }, err => res.status(500).json({code: err.code || 0, description: err.message}))

                }, err => console.error(err))

            break
        case 'saved':
            if(authorized(req, res, {operation: Operation.RETRIEVE, others: noAuthorizationForOther(id) })){
                Recipe.findOne()
                    .where('_id').equals(recipeID)
                    .where('owner').equals(id)
                    .where('shared').equals(false)
                    .then(recipe => {
                        if(!recipe) return res.status(404).json({description: 'Recipe is not found'})
                        return  res.status(200).json(recipe)
                    }, err => res.status(500).json({code: err.code || 0, description: err.message}))
            }
            break
        case 'loved':
            if(authorized(req, res, {operation: Operation.RETRIEVE, others: noAuthorizationForOther(id) })){
                Recipe.findOne()
                    .where('_id').equals(recipeID)
                    .where('shared').equals(true)
                    .where('likes.user').equals(Types.ObjectId(id))
                    .then(recipe => {
                        if(!recipe) return res.status(404).json({description: 'Recipe is not found'})
                        return res.status(200).json(recipe)
                    }, err => res.status(500).json({code: err.code || 0, description: err.message}))
            }
            break
        case 'shared-in-chat':
            if(authorized(req, res, {operation: Operation.RETRIEVE, others:  noAuthorizationForOther(id) })){
                Recipe.findOne()
                    .where('_id').equals(recipeID)
                    .where('permission.user').equals(id)
                    .where('owner').ne(id)
                    .then(recipe => {
                        if(!recipe) return res.status(404).json({description: 'Recipe is not found'})
                        return  res.status(200).json(recipe)
                    }, err => res.status(500).json({code: err.code || 0, description: err.message}))
            }
            break
    }
}

function update_actual_recipe(req, res){
    if(checkRequestHeaders(req, res, {'content-type': 'multipart/form-data'})){
        let {id, recipeID} = req.params
        if(!Types.ObjectId.isValid(id)) return res.status(400).json({ description: 'Required a valid \'id\''})
        if(!Types.ObjectId.isValid(recipeID)) return res.status(400).json({ description: 'Required a valid \'recipeID\''})
        if(Object.keys(req.body).length === 0) return res.status(400).json({ description: 'Required body'})

        const decodedToken = authorized(req, res, {operation: Operation.UPDATE})
        if(decodedToken) {
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
                                            return res.status(500).json({code: err.code || 0, description: err.message})
                                        })
                        }, err => res.status(500).json({code: err.code || 0, description: err.message}))
                }, err => console.error(err))
        }
    }
}

function update_permission_recipe(req, res){
    if(checkRequestHeaders(req, res, {'content-type': 'application/json'})){
        const {id, recipeID} = req.params
        if(!Types.ObjectId.isValid(id)) return res.status(400).json({ description: 'Required a valid \'id\''})
        if(!Types.ObjectId.isValid(recipeID)) return res.status(400).json({ description: 'Required a valid \'recipeID\''})

        const err_ms_empty = "Permission must be array and have at least one element"
        const permission = req.body.permission

        if(!permission) return res.status(400).json({ description:  err_ms_empty })
        if(!permission.every(p => p.user)) return res.status(400).json({ description: 'Elements of \'Permission\' must be of the form : { user: string, granted?: string }'})

        console.debug(permission)

        existById(User, permission.map(p => p.user))
            .then(() =>{
                const decodedToken = authorized(req, res, { operation: Operation.UPDATE })
                if(decodedToken) {
                    Recipe.findOne()
                        .where('_id').equals(recipeID)
                        .then(recipe => {

                            if(!recipe) return res.status(404).json({description: 'Recipe is not found'})
                            if(!(decodedToken._id == recipe.owner._id || recipe.permission.find(p => p.user._id == decodedToken._id && GrantedType.isRootPermission(p.granted))))
                                return res.status(403).json({ description: 'User is not allowed to update permissions.' })

                            //UPDATE PERMISSION
                            permission.forEach(per => recipe.permission.push(per))
                            recipe.save()
                                .then(_doc => res.status(200).json({ description: 'Permission has been updated', updatedPermission: _doc.permission}),
                                    err => res.status(500).json({ code: err.code || 0, description: err.message }))

                        }, err => res.status(500).json({code: err.code || 0, description: err.message}))
                }
            }, err => {
                if(Array.isArray(err)) res.status(404).json({description: 'Users [' + err +'] are not founds.'})
                else res.status(400).json({ description: err_ms_empty })
            })
    }
}

enum UpdateType {
    PERMISSION = 'permission'
}
export function update_recipe(req, res){
    const { field } = req.query
    switch (field as UpdateType){
        case UpdateType.PERMISSION:
            return update_permission_recipe(req, res)
        default:
            return update_actual_recipe(req, res)
    }
}

export function delete_recipe(req, res){
    let {id, recipeID} = req.params
    if(!Types.ObjectId.isValid(id))  return res.status(400).json({ description: 'Required a valid \'id\''})
    if(!Types.ObjectId.isValid(recipeID))  return res.status(400).json({ description: 'Required a valid \'recipeID\''})

    const decodedToken = authorized(req, res, { operation: Operation.DELETE })
    if(decodedToken){
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
}

export function list_all_recipes(req, res){
    getUser(req, res)
        .then(user => {

            let {page, limit} = req.query

            let filters = getFilters(req.query)
            pagination(
                Recipe.find(filters).sort({ createdAt: -1, _id: -1 }),
                page && limit ? {page: +page, limit: +limit}: undefined,
            )
            .then(recipes => res.status(200).json(recipes),
                  err => res.status(500).json({code: err.code || 0, description: err.message}))

        }, err => console.error(err))
}

export function numberRecipesForCountry(req, res){
    getUser(req, res)
        .then(user => {

            Recipe.aggregate([
                { $match: { shared: true } },
                { $group: { _id: "$country",  number: { $sum : 1 } } },
                { $project: { country: "$_id", number: 1, _id: 0 } }
            ])
            .then(items => res.status(200).json(items),
                  err => res.status(500).json({code: err.code || 0, description: err.message}))

        }, err => console.error(err))
}