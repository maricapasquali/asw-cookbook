import {Food, ShoppingList, User} from "../../models";
import {MongooseDuplicateError, MongooseValidationError} from "../../modules/custom.errors";
import {Types} from "mongoose";
import {IUser} from "../../models/schemas/user";
import {RBAC} from "../../modules/rbac";

import {userIsAuthorized} from "../index";

function authorized(req, res, options: {operation: RBAC.Operation}): {_id: string, role: string} | false {
    return userIsAuthorized(req, res, {
        operation: options.operation,
        subject: RBAC.Subject.SHOPPING_LIST,
        others: (decodedToken) => decodedToken._id !== req.params.id
    })
}

function getUser(req, res): Promise<IUser | any> {
    let {id} = req.params
    if(!Types.ObjectId.isValid(id)) return res.status(400).json({ description: 'Required a valid \'id\''})
    return User.findOne()
               .where('signup').equals('checked')
               .where('credential.role').equals('signed')
               .where('_id').equals(id)
               .then(user => {
                    if (!user) {
                        res.status(404).json({description: 'User is not found.'});
                        return Promise.reject({code: 404, description: 'User is not found.'})
                    }
                    return Promise.resolve(user);
               }, err => res.status(500).json({code: err.code || 0, description: err.message}))
}

export function add_food(req, res){
    if(authorized(req, res, {operation: RBAC.Operation.CREATE})){
        let body = req.body
        if(!Types.ObjectId.isValid(body.food)) return res.status(400).json({ description: 'Required a valid \'foodID\' '})

        getUser(req, res)
            .then(user => {
                Food.findOne()
                    .where('_id').equals(body.food)
                    .then(food => {
                        if(!food) return res.status(404).json({description: 'Food is not found.'})

                        ShoppingList.findOne()
                            .where('user').equals(user._id)
                            .then(doc => {
                                if(!doc) {
                                    new ShoppingList({ user: user._id, shoppingList: [body] })
                                        .save()
                                        .then(_doc => res.status(201).json({ pointShoppingListID: _doc.shoppingList.pop()._id }),
                                            err => {
                                                console.error(err);
                                                if(MongooseValidationError.is(err)) return res.status(400).json({ description: err.message })
                                                return res.status(500).json({ code: err.code, description: err.message })
                                            }
                                        )
                                }
                                else{
                                    doc.shoppingList.push(body)
                                    doc.save()
                                        .then(_doc => res.status(201).json({ pointShoppingListID: _doc.shoppingList.pop()._id }),
                                            err => {
                                                console.error(err)
                                                if (MongooseValidationError.is(err)) return res.status(400).json({description: err.message})
                                                if (MongooseDuplicateError.is(err)) return res.status(409).json({description: 'Food has been already inserted in the shopping list.'})
                                                return res.status(500).json({code: err.code, description: err.message})
                                            }
                                        )
                                }
                            }, err => res.status(500).json({ code: err.code || 0, description: err.message }))

                    }, err => res.status(500).json({ code: err.code || 0, description: err.message }))
            }, err => console.error(err))
    }
}

export function list(req, res){
    if(authorized(req, res, {operation: RBAC.Operation.RETRIEVE}))
        getUser(req, res)
            .then(user => {
                ShoppingList.findOne()
                    .where('user').equals(user._id)
                    .populate('shoppingList.food')
                    .then(doc => res.status(200).json(doc ? doc.shoppingList : []),
                            err => res.status(500).json({ code: err.code || 0, description: err.message }))
            }, err => console.error(err))
}

function _updateFoodOnShoppingList(req, res, options: {body?: { checked: Boolean }, responseDescription: Object}){
    let {pointShoppingListID} = req.params
    if(!Types.ObjectId.isValid(pointShoppingListID)) return res.status(400).json({ description: 'Required a valid \'pointShoppingListID\''})

    if(options.body && options.body.checked === undefined) return res.status(400).json({ description: 'Body required field \'checked: boolean\' '})

    getUser(req, res)
        .then(user =>{
            ShoppingList.findOne()
                        .where('user').equals(user._id)
                        .then(doc => {
                            if(!doc) return res.status(404).json({description: 'Shopping List is not found.'})
                            let index = doc.shoppingList.findIndex(p => p._id == pointShoppingListID)
                            if(index === -1) return res.status(404).json({description: 'Food is not found in the shopping list.'})
                            if(options.body) doc.shoppingList.splice(index, 1, Object.assign(doc.shoppingList[index], req.body))
                            else doc.shoppingList.splice(index, 1)
                            doc.save()
                               .then(_doc => res.status(200).json({description: options.responseDescription}),
                                    err => res.status(500).json({ code: err.code || 0, description: err.message }))
                        }, err => res.status(500).json({ code: err.code || 0, description: err.message }))
        }, err => console.error(err))
}

export function update_food_on_list(req, res){
  if(authorized(req, res, {operation: RBAC.Operation.UPDATE}))
       _updateFoodOnShoppingList(req, res, {responseDescription: "Shopping List point has been updated", body: req.body})
}

export function delete_food_on_list(req, res){
    if(authorized(req, res, {operation: RBAC.Operation.DELETE}))
        _updateFoodOnShoppingList(req, res, {responseDescription: "Shopping List point has been deleted"})
}