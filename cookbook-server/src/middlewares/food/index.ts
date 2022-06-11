import {Types} from "mongoose";
import {Middlewares, checkRestrictedRBAC, checkNormalRBAC, Middleware} from "../base";
import {RBAC} from "../../libs/rbac";
import Resource = RBAC.Resource;
import Operation = RBAC.Operation;
import {Food} from "../../models";

export function create(): Middlewares {
    return checkRestrictedRBAC({
        operation: Operation.CREATE,
        resource: Resource.FOOD,
        ignoreValidationParamId: true
    })
}

export function list(): Middlewares {
    return [
        checkNormalRBAC(),
        // Check parameters, queries of request
        function (req, res, next){
            let { page, limit, name, barcode, owner } = req.query
            if(page && limit && (isNaN(page) || isNaN(limit))) return next({ status: 400, description: 'Required that page and limit are number'})

            let filters = {}
            if(name || barcode){
                filters = { name: { $regex: `^${name}`, $options: "i" }, barcode: { $regex: `^${barcode}`, $options: "i" }  }
                if(!name) delete filters['name']
                if(!barcode) delete filters['barcode']
            }
            if(owner) filters['owner'] = { $eq: owner }
            console.debug('Foods filters = ', JSON.stringify(filters, null, 2))
            req.locals.filters = filters
            next()
        }
    ]
}

export function one(): Middlewares {
    return [
        checkNormalRBAC(),
        // Check parameters, queries of request
        function (req, res, next){
            let {id} = req.params
            if(!Types.ObjectId.isValid(id)) return next({ status: 400, description: 'Required a valid \'id\''})
            next()
        }
    ]
}

export function update(): Middlewares {
    return [
        function (req, res, next) {
            req.locals = req.locals || {}

            return Food.findOne()
                       .where('_id').equals(req.params.id)
                       .then(food => {
                           if(!food) return res.status(404).json({description: 'Food is not found.'})

                           req.locals.food = food

                           return checkRestrictedRBAC({
                                operation: Operation.UPDATE,
                                resource: Resource.FOOD,
                                others: (decodedToken) =>  decodedToken._id != food.owner._id,
                                ignoreValidationParamId: true
                           })(req, res, next)

                       }, err => res.status(500).json({description: err.message}))
        },
        // Check parameters, queries, body of request
        function (req, res, next) {
            let {id} = req.params
            if(!Types.ObjectId.isValid(id)) return next({ status: 400, description: 'Required a valid \'id\'' })

            let updateBody = req.body
            if(Object.keys(updateBody).length === 0)
                return next({
                    status: 400,
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

            if(updateBody.name && typeof updateBody.name !== 'string')
                return next({ status: 400, description: 'name must be a string' })

            if(updateBody.barcode && typeof updateBody.barcode !== 'string')
                return next({ status: 400, description: 'barcode must be a string' })

            next()
        }
    ]
}
