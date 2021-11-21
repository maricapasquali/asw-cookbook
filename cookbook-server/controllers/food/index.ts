import {Food} from '../../models'
import {Types} from "mongoose";
import {extractAuthorization} from "../../modules/utilities";
import {IJwtToken, JwtToken} from "../../modules/jwt.token";
import {IRbac, RBAC} from "../../modules/rbac";

const tokensManager: IJwtToken = new JwtToken()
const accessManager: IRbac = new RBAC()

export function uploadImage() {}

function authorized(req, res, options: {operation: RBAC.Operation} ){
    const {access_token} = extractAuthorization(req.headers)
    if(!access_token) {
        res.status(400).json({description: 'Missing authorization.'})
        return false
    }
    let decoded_token = tokensManager.checkValidityOfToken(access_token);
    if(!decoded_token) {
        res.status(401).json({description: 'User is not authenticated'})
        return false
    }
    if(!accessManager.isAuthorized(decoded_token.role, options.operation, RBAC.Subject.FOOD)) {
        res.status(403).json({description: 'User is unauthorized'})
        return false
    }
    return decoded_token
}

export function create_food(req, res) {
    let user = authorized(req, res, {operation: RBAC.Operation.CREATE})
    if(user){
        const new_food = new Food({...(req.body), owner: user._id})
        new_food.save()
                .then(food => res.status(201).json({ foodID: food._id }),
                      err => {
                        if(err.name === 'ValidationError')
                            return res.status(400).json({ description: err.message })
                        if(err.code === 11000)
                            return res.status(409).json({ description: 'Food has been already inserted' })
                        res.status(500).json({ code: 0, description: err.message })
                      }
                )
    }
}

export function list_foods(req, res) {
    if(authorized(req, res, {operation: RBAC.Operation.RETRIEVE})){
        let { page, limit } = req.query
        if(page && limit && (isNaN(page) || isNaN(limit))) return res.status(400).json({ description: 'Required that page and limit are number'})
        Food.countDocuments().then(nDocs  => {
            let response = {items: [], total: 0, paginationInfo: undefined}

            let query = Food.find()
                            .collation({ 'locale': 'en' }) // sort case insensitive
                            .sort({ 'name': 1 });

            if(page && limit) {
                page = +page
                limit = +limit
                response.paginationInfo = {page: page, perPage: limit}
                query = query.limit(limit).skip((page - 1) * limit)
            }

            query.then(foods => {
                response.items = foods
                response.total = nDocs
                return res.status(200).json(response)
            }, err => res.status(500).json({description: err.message}))
        })
    }

}

export function one_food(req, res) {
    if(authorized(req, res, {operation: RBAC.Operation.RETRIEVE})){
        let {id} = req.params
        if(!Types.ObjectId.isValid(id)) return res.status(400).json({ description: 'Required a valid \'id\''})

        Food.findOne()
            .where('_id').equals(id)
            .then(food => {
                if(!food) return res.status(404).json({description: 'Food is not found'})
                return res.status(200).json(food)
            }, err => res.status(500).json({ description: err.message }))
    }
}