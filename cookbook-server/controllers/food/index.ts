import {Food} from '../../models'
import {Types} from "mongoose";

import {MongooseDuplicateError, MongooseValidationError} from "../../modules/custom.errors";
import {Pagination} from "../../modules/pagination";

export function uploadImage() {}
export function create_food(req, res) {
    const user = req.locals.user
    const new_food = new Food({...(req.body), owner: user._id})
    new_food.save()
        .then(food => res.status(201).json(food),
            err => {
                if(MongooseValidationError.is(err))
                    return res.status(400).json({ description: err.message })
                if(MongooseDuplicateError.is(err))
                    return res.status(409).json({ description: 'Food has been already inserted' })
                res.status(500).json({ code: 0, description: err.message })
            }
        )
}

export function list_foods(req, res) {
    let { page, limit, name, barcode, owner } = req.query
    if(page && limit && (isNaN(page) || isNaN(limit))) return res.status(400).json({ description: 'Required that page and limit are number'})

    let filters = {}
    if(name || barcode){
        filters = { name: { $regex: `^${name}`, $options: "i" }, barcode: { $regex: `^${barcode}`, $options: "i" }  }
        if(!name) delete filters['name']
        if(!barcode) delete filters['barcode']
    }
    if(owner) filters['owner'] = { $eq: owner }
    console.debug('Foods filters = ', JSON.stringify(filters, null, 2))
    Pagination.ofQueryDocument(
        Food.find(filters).collation({ 'locale': 'en' } /* sort case insensitive */ ).sort({ createdAt: -1 }),
        page && limit ? {page: +page, limit: +limit}: undefined
    )
        .then(paginationResult => res.status(200).json(paginationResult),
            err => res.status(500).json({description: err.message}))

}

export function one_food(req, res) {
    let {id} = req.params
    if(!Types.ObjectId.isValid(id)) return res.status(400).json({ description: 'Required a valid \'id\''})

    Food.findOne()
        .where('_id').equals(id)
        .then(food => {
            if(!food) return res.status(404).json({description: 'Food is not found'})
            return res.status(200).json(food)
        }, err => res.status(500).json({ description: err.message }))
}

export function update_food(req, res){
    let {id} = req.params
    if(!Types.ObjectId.isValid(id)) return res.status(400).json({ description: 'Required a valid \'id\''})

    let updateBody = req.body
    if(Object.keys(updateBody).length === 0)
        return res.status(400).json({
            description: 'Required body have to contain: '+
                'name?: string, barcode?: string, '+
                'nutritional_values?: { ' +
                    'energy?: number, ' +
                    'protein?: number, ' +
                    'salt?: number, ' +
                    'carbohydrates?: { complex: number, sugar: number }, ' +
                    'fat?: { unsaturated: number, saturated: number } ' +
                '}'
        })

    delete updateBody.owner
    delete updateBody.createdAt
    delete updateBody._id
    if(updateBody.name && typeof updateBody.name !== 'string')
        return res.status(400).json({ description: 'name must be a string'})
    if(updateBody.barcode && typeof updateBody.barcode !== 'string')
        return res.status(400).json({ description: 'barcode must be a string'})

    let food = req.locals.food

    Object.entries(updateBody).forEach(([k, v]) => food[k] = typeof v === 'object' ? Object.assign(food[k], v): v )

    food.save()
        .then(updatedFood => res.json(updatedFood),
            err => {
                if(MongooseValidationError.is(err)) return res.status(400).json({ description: err.message })
                return res.status(500).json({description: err.message})
            }
        )
}
