import {Food} from '../../models'
import {Types} from "mongoose";

import {MongooseDuplicateError, MongooseValidationError} from "../../libs/custom.errors";
import {Pagination} from "../../libs/pagination";

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
    let { page, limit } = req.query
    Pagination.ofQueryDocument(
        Food.find(req.locals.filters).collation({ 'locale': 'en' } /* sort case insensitive */ ).sort({ createdAt: -1 }),
        page && limit ? {page: +page, limit: +limit}: undefined
    )
        .then(paginationResult => res.status(200).json(paginationResult),
            err => res.status(500).json({description: err.message}))

}

export function one_food(req, res) {
    Food.findOne()
        .where('_id').equals(req.params.id)
        .then(food => {
            if(!food) return res.status(404).json({description: 'Food is not found'})
            return res.status(200).json(food)
        }, err => res.status(500).json({ description: err.message }))
}

export function update_food(req, res){
    let updateBody = req.body
    delete updateBody.owner
    delete updateBody.createdAt
    delete updateBody._id

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
