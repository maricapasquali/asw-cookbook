import {Middlewares, checkRestrictedRBAC, checkNormalRBAC} from "../base";
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
    return checkNormalRBAC()
}

export function one(): Middlewares {
    return checkNormalRBAC()
}

export function update(): Middlewares {
    return function (req, res, next) {
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
    }
}
