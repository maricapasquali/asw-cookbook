import {Food, ShoppingList, User} from "../../models";
import {MongooseDuplicateError, MongooseValidationError} from "../../modules/custom.errors";
import {Types} from "mongoose";
import {RBAC} from "../../modules/rbac";

import {accessManager, existById, getRestrictedUser} from "../index";
import Subject = RBAC.Subject;
import Operation = RBAC.Operation;
import {IShoppingList} from "../../models/schemas/shopping-list";
import {DecodedTokenType} from "../../modules/jwt.token";
import Role = RBAC.Role;
import {SignUp} from "../../models/schemas/user";

function authorized(req, res, options: {operation: Operation, subject?: Subject}): {_id: string, role: string} | false {
    let id = req.params.id
    if(!Types.ObjectId.isValid(id)) {
        res.status(400).json({ description: 'Required a valid \'id\''})
        return false
    }
    return getRestrictedUser(req, res, {
        operation: options.operation,
        subject: options.subject || Subject.SHOPPING_LIST_POINT,
        others: (decodedToken) => decodedToken._id !== id
    })
}

function getExistsUserChecked(id: string, res): Promise<string> {
    return User.exists({ _id: { $eq: id }, signup: SignUp.State.CHECKED, 'credential.role': Role.SIGNED })
               .then(exist => {
                   console.debug('User exist = ', exist)
                   if (exist) return Promise.resolve(id);
                   else {
                       let code = 404
                       let message = 'User is not found.'
                       res.status(code).json({ description: message });
                       return Promise.reject({ code: code, description: message });
                   }
               }, err => res.status(500).json({code: err.code || 0, description: err.message}));
}

export function add_food(req, res){
    let {id} = req.params
    let body = req.body
    if(!Types.ObjectId.isValid(id)) return res.status(400).json({ description: 'Required a valid \'id\''})
    if(!Types.ObjectId.isValid(body.food)) return res.status(400).json({ description: 'Required a valid \'food\' '})

    const user = getRestrictedUser(req, res)
    if(user) {
        let others = user._id !== id
        let isAuthorized = accessManager.isAuthorized(user.role, Operation.CREATE, Subject.SHOPPING_LIST, others) &&
                           accessManager.isAuthorized(user.role, Operation.CREATE, Subject.SHOPPING_LIST_POINT, others)
        if(!isAuthorized) return res.status(403).json({description: 'User is unauthorized'})

        getExistsUserChecked(user._id, res)
            .then(() => {

                existById(Food, [body.food])
                    .then(() => {

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
                                            console.log('Update list ..')
                                            doc.shoppingList.push(body)
                                            doc.save().then(_doc => sendNewListPoint(_doc), err => handlerError(err, {newPoint: true}))
                                        }
                                        else {
                                            console.log('Crete list ..')
                                            new ShoppingList({ user: user._id, shoppingList: [body] })
                                                .save().then(_doc => sendNewListPoint(_doc), err => handlerError(err, {newList: true}))
                                        }
                                    }, err => res.status(500).json({ code: err.code || 0, description: err.message }))

                    }, ids => res.status(404).json({description: 'Food is not found.'}))

            }, err => console.error(err))
    }
}

export function list(req, res){
    let decodedToken = authorized(req, res, {operation: Operation.RETRIEVE, subject: Subject.SHOPPING_LIST })
    if(decodedToken)
        getExistsUserChecked(decodedToken._id, res)
            .then(_id => {
                ShoppingList.findOne()
                    .where('user').equals(_id)
                    .populate('shoppingList.food')
                    .then(doc => res.status(200).json(doc ? doc.shoppingList : []),
                            err => res.status(500).json({ code: err.code || 0, description: err.message }))
            }, err => console.error(err))
}

function _updateFoodOnShoppingList(req: any, res: any, user: DecodedTokenType, options: {body?: { checked: Boolean }, responseDescription: Object}){
    let {pointShoppingListID} = req.params
    if(!Types.ObjectId.isValid(pointShoppingListID)) return res.status(400).json({ description: 'Required a valid \'pointShoppingListID\''})

    if(options.body && options.body.checked === undefined) return res.status(400).json({ description: 'Body required field \'checked: boolean\' '})

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
    let user = authorized(req, res, {operation: Operation.UPDATE})
    if(user) _updateFoodOnShoppingList(req, res, user, {responseDescription: "Shopping List point has been updated", body: req.body})
}

export function delete_food_on_list(req, res){
    let user = authorized(req, res, {operation: Operation.DELETE})
    if(user) _updateFoodOnShoppingList(req, res, user, {responseDescription: "Shopping List point has been deleted"})
}