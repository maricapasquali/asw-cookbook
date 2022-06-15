import * as _ from "lodash"
import { Types } from "mongoose"
import {
    checkNormalRBAC,
    checkRestrictedRBAC,
    Middleware,
    Middlewares
} from "../../base"
import { RBAC } from "../../../libs/rbac"
import {
    FriendShip,
    FriendShipPopulateOptions
} from "../../../models/schemas/user/friend"
import { existById } from "../../../database/utils"
import { User } from "../../../models"
import Resource = RBAC.Resource
import Operation = RBAC.Operation

// Check parameters, queries, body of request
function checkParamsQueriesBody(operation: RBAC.Operation): Middleware {
    return function (req, res, next) {
        req.locals = req.locals || {}

        const { id } = req.params
        if (!Types.ObjectId.isValid(id)) {
            return next({ status: 400, description: "Required a valid 'id'" })
        }

        switch (operation) {
            case RBAC.Operation.CREATE: {
                const user = req.locals.user
                return existById(User, [id, user._id], { "credential.role": RBAC.Role.SIGNED })
                    .then(() => next(), ids => next({ status: 404, description: "Users [" + ids + "] are not found." }))
            }
            case RBAC.Operation.RETRIEVE: {
                let userID = req.query.userID
                const state = req.query.state
                const searchAvailableValue = ["partial", "full"]
                if (userID) {
                    try {
                        userID = JSON.parse(userID)
                        if (!userID.search || !userID.value) throw new Error()
                    } catch (e) {
                        return next({ status: 400, description: "Parameter 'userID' is malformed. It must be of form: {\"search\": string, \"value\": string}" })
                    }
                    if (!searchAvailableValue.includes(userID.search)) {
                        return next({ status: 400, description: `Parameter 'userID.search' must be in ${searchAvailableValue}.` })
                    }
                }

                const { id } = req.params
                const decodedToken = req.locals.user

                const filters = { $or: [{ from: { $eq: id } }, { to: { $eq: id } }], state: FriendShip.State.ACCEPTED }
                if (decodedToken && decodedToken._id == id) {
                    if (state) {
                        if (!FriendShip.State.values().includes(state)) return next({ status: 400, description: "State must be in [" + FriendShip.State.values() + "]" })
                        filters.state = state
                    } else delete filters.state
                } else {
                    if (state) return next({ status: 400, description: "Query 'state' is not available." })
                }
                console.debug("filters = ", JSON.stringify(filters))

                const populatePipeline = _.cloneDeep(FriendShipPopulateOptions)
                if (userID) {
                    const regexObject = { $regex: `^${userID.value}`, $options: "i" }
                    if (userID.search === "full") regexObject.$regex += "$"
                    Object.assign(populatePipeline.match, { "credential.userID": regexObject })
                }
                console.debug("populateOpts = ", JSON.stringify(populatePipeline))

                req.locals.filters = filters
                req.locals.populatePipeline = populatePipeline
            }
                break
            case RBAC.Operation.UPDATE: {
                if (!Types.ObjectId.isValid(req.params.friendID)) {
                    return next({ status: 400, description: "Required a valid 'friendID'" })
                }

                const { state } = req.body
                if (!state || !FriendShip.State.changeable()
                    .includes(state)) {
                    return next({
                        status: 400,
                        description: "Body must be of form: { state: string } with state in [" + FriendShip.State.changeable() + "]"
                    })
                }
            }
                break
            case RBAC.Operation.DELETE:
                if (!Types.ObjectId.isValid(req.params.friendID)) {
                    return next({ status: 400, description: "Required a valid 'friendID'" })
                }
                break
            default: return next({ status: 400, description: "Operation " + operation + " not valid." })
        }
        next()
    }
}

export function create(): Middlewares {
    return [
        checkRestrictedRBAC({
            resource: Resource.FRIEND,
            operation: Operation.CREATE,
            others: (decodedToken, paramId) => decodedToken._id === paramId
        }),
        checkParamsQueriesBody(Operation.CREATE)
    ]
}

export function list(): Middlewares {
    return [
        checkNormalRBAC({
            operation: Operation.RETRIEVE,
            resource: Resource.FRIEND,
            others: (decodedToken, paramId) => RBAC.Role.isAdmin(decodedToken.role) && decodedToken._id != paramId
        }),
        checkParamsQueriesBody(Operation.RETRIEVE)
    ]
}

export function update(): Middlewares {
    return [
        checkRestrictedRBAC({
            operation: Operation.UPDATE,
            resource: Resource.FRIEND,
            others: (decodedToken, paramId) => decodedToken._id !== paramId
        }),
        checkParamsQueriesBody(Operation.UPDATE)
    ]
}

export function erase(): Middlewares {
    return [
        checkRestrictedRBAC({
            operation: Operation.DELETE,
            resource: Resource.FRIEND,
            others: (decodedToken, paramId) => decodedToken._id !== paramId
        }),
        checkParamsQueriesBody(Operation.DELETE)
    ]
}
