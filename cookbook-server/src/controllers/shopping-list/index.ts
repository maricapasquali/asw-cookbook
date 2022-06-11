import {ShoppingList} from "../../models";
import {MongooseDuplicateError, MongooseValidationError} from "../../libs/custom.errors";
import {IShoppingList} from "../../models/schemas/shopping-list";

export function add_food(req, res){
    const body = req.body
    const user = req.locals.user

    ShoppingList.findOne()
                .where('user').equals(user._id)
                .then(doc => {

                    const sendNewListPoint = (_doc: IShoppingList) => {
                        console.debug(_doc)
                        _doc.populate('shoppingList.food', function (err, docPopulate){
                            if(err) return res.status(500).json({ description: err.message })
                            return res.status(201).json(docPopulate.shoppingList.pop())
                        })
                    }

                    const handlerError = (_err: any, options: {newList?:boolean, newPoint?: boolean}) => {
                        console.error(_err);
                        if(MongooseValidationError.is(_err)) return res.status(400).json({ description: _err.message })
                        if(MongooseDuplicateError.is(_err))
                            return res.status(409).json({
                                description: options.newList ? 'User already owns a list.' :
                                    options.newPoint ? 'Food has been already inserted in the shopping list.': 'Duplicate.'
                            })
                        return res.status(500).json({ code: _err.code, description: _err.message })
                    }

                    if(doc) {
                        console.debug('Update list ..')
                        doc.shoppingList.push(body)
                        doc.save().then(_doc => sendNewListPoint(_doc), err => handlerError(err, {newPoint: true}))
                    }
                    else {
                        console.debug('Crete list ..')
                        new ShoppingList({ user: user._id, shoppingList: [body] })
                            .save().then(_doc => sendNewListPoint(_doc), err => handlerError(err, {newList: true}))
                    }

                }, err => res.status(500).json({ code: err.code || 0, description: err.message }))
}

export function list(req, res){
    const decodedToken = req.locals.user
    ShoppingList.findOne()
                .where('user').equals(decodedToken._id)
                .populate('shoppingList.food')
                .then(doc => res.status(200).json(doc ? doc.shoppingList : []),
                      err => res.status(500).json({ code: err.code || 0, description: err.message }))
}

function _updateFoodOnShoppingList(req: any, res: any, options: { body?: { checked: Boolean }, responseDescription: string }){
    const {pointShoppingListID} = req.params
    const user = req.locals.user

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
}

export function update_food_on_list(req, res){
    _updateFoodOnShoppingList(req, res, {responseDescription: "Shopping List point has been updated", body: req.body})
}

export function delete_food_on_list(req, res){
    _updateFoodOnShoppingList(req, res, {responseDescription: "Shopping List point has been deleted"})
}
