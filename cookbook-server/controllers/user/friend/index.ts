import {existById, getRestrictedUser, getUser} from "../../index";
import {Friend, User} from "../../../models";
import {Types} from "mongoose";
import {DecodedTokenType} from "../../../modules/jwt.token";
import {RBAC} from "../../../modules/rbac";
import {FriendShip, IFriend} from "../../../models/schemas/user/friend";
import {MongooseDuplicateError, MongooseValidationError} from "../../../modules/custom.errors";
import * as _ from "lodash";
import Operation = RBAC.Operation;
import Subject = RBAC.Subject;

const FriendShipPopulateOptions = {
    path: 'from to',
    select: {
        userID: '$credential.userID',
        img: '$information.img',
        country: '$information.country',
        occupation: '$information.occupation',
    },
    match: {}
}


function sendPopulateFriendShip(friendShip: IFriend, me: string, responseOptions: {response: any, status: number}) {
    friendShip.populate(FriendShipPopulateOptions, function (err, populateFriend){
        if(err) return responseOptions.response.status(500).json({description: err.message})
        return responseOptions.response.status(responseOptions.status).json(populateFriend)
    })
}

export function request_friendship(req, res){
    let {id} = req.params
    if(!Types.ObjectId.isValid(id)) return res.status(400).json({description: 'Required a valid \'id\''})

    const decodedToken: DecodedTokenType | false =
        getRestrictedUser(req, res,
            {
                subject: Subject.FRIEND,
                operation: Operation.CREATE,
                others: (decodedToken => decodedToken._id === id)
            })
    if(decodedToken) {
        Friend.exists({from: id, to: decodedToken._id})
              .then((result) => {
                  if(result) return res.status(409).json({description: 'Request has already been exist. '})

                  existById(User, [id, decodedToken._id])
                      .then(() => {

                          new Friend({ from: decodedToken._id, to: id })
                                .save()
                                .then(_friendShip => sendPopulateFriendShip(_friendShip, decodedToken._id, {response: res, status: 201}),
                                      err => {
                                        if(MongooseValidationError.is(err)) return res.status(400).json({ description: err.message })
                                        if(MongooseDuplicateError.is(err)) return res.status(409).json({description: 'Request has already been sent. '})
                                        return res.status(500).json({code: err.code || 0, description: err.message})
                                      }
                                )

                      }, ids => res.status(404).json({ description: 'User is not found.' }))

                  },   err => res.status(500).json({code: err.code || 0, description: err.message})
              )
    }

}

export function list_friends(req, res){
    const {id} = req.params
    let {page, limit, userID, state} = req.query
    if(!Types.ObjectId.isValid(id)) return res.status(400).json({description: 'Required a valid \'id\''})

    const searchAvailableValue = ['partial', 'full']
    if(userID) {
        try {
            userID = JSON.parse(userID)
            if(!userID.search || !userID.value) throw new Error()
        } catch (e) {
            return res.status(400).json({ description: 'Parameter \'userID\' is malformed. It must be of form: {"search": string, "value": string}' })
        }
        if(!searchAvailableValue.includes(userID.search))
            return res.status(400).json({ description: `Parameter \'userID.search\' must be in ${searchAvailableValue}.` })
    }

    getUser(req, res, { operation: Operation.RETRIEVE, subject: Subject.FRIEND })
        .then((decodedToken) => {

            const filters = { $or: [ { from: { $eq: id } }, { to: { $eq: id } } ], state : FriendShip.State.ACCEPTED }
            if(decodedToken && decodedToken._id == id) {
                if(state) {
                    if(!FriendShip.State.values().includes(state)) return res.status(400).json({ description: 'State must be in ['+FriendShip.State.values()+']' })
                    filters.state = state
                }
                else delete filters.state

            } else {
                if(state) return res.status(400).json({ description: 'Query \'state\' is not available.' })
            }
            console.debug('filters = ', JSON.stringify(filters))

            let populatePipeline = _.cloneDeep(FriendShipPopulateOptions)
            if(userID) {
                let regexObject = { $regex: `^${userID.value}`, $options: "i" }
                if(userID.search === 'full') regexObject['$regex']+='$'
                Object.assign(populatePipeline.match, { 'credential.userID' : regexObject })
            }
            console.debug('populateOpts = ', JSON.stringify(populatePipeline))

            Friend.find(filters)
                  .populate(populatePipeline)
                  .then((friends) =>{
                      let mapperItems = friends
                      if(userID) {
                          mapperItems = friends.filter(
                              friend => ! (!friend.from && !friend.to) &&
                                        ( ( friend.from && friend.from._id != id ) || ( friend.to && friend.to._id != id ))
                          )
                      }
                      const fieldToSort = (friend: any): string => {
                          if(!friend.from || friend.from._id == id) return friend.to.userID
                          else if(!friend.to || friend.to._id == id) return friend.from.userID
                      }
                      mapperItems = mapperItems.map(friend => friend.toObject())
                                               .sort((f1, f2) => fieldToSort(f1).localeCompare(fieldToSort(f2))) as Array<IFriend>

                      let start: number = 0
                      let end: number = mapperItems.length
                      let paginationOptions = page && limit ? { page: +page, limit: +limit } : undefined
                      if(paginationOptions){
                          start = (paginationOptions.page - 1) * paginationOptions.limit
                          end = start + paginationOptions.limit
                          console.debug('start = ', start, ', end = ', end)
                      }

                      return res.status(200).json({ items: mapperItems.slice(start, end), total: mapperItems.length, paginationInfo: paginationOptions })

                  }, err => res.status(500).json({code: err.code || 0, description: err.message}))

        }, err => console.error(err))
}

export function update_friendship(req, res){
    let {id, friendID} = req.params
    if(!Types.ObjectId.isValid(id)) return res.status(400).json({description: 'Required a valid \'id\''})
    if(!Types.ObjectId.isValid(friendID)) return res.status(400).json({description: 'Required a valid \'friendID\''})

    const {state} = req.body
    if(!state || !FriendShip.State.changeable().includes(state))
        return res.status(400).json({
            description: 'Body must be of form: { state: string } with state in ['+FriendShip.State.changeable()+']'
        })

    const decodedToken: DecodedTokenType | false = getRestrictedUser(req, res, {
        operation: Operation.UPDATE,
        subject: Subject.FRIEND,
        others: decodedToken => decodedToken._id !== id
    })

    if(decodedToken){
        Friend.findOne()
              .where('to').equals(id)
              .where('from').equals(friendID)

              .then(friendship => {
                  if(!friendship) return res.status(404).json('FriendShip is not found.')

                  if(!FriendShip.State.isPending(friendship.state))
                      return res.status(409).json({ description: 'State friendship has already been changed.'})

                  friendship.state = state
                  friendship.updatedAt = Date.now()

                  friendship.save()
                            .then(_friendShip => sendPopulateFriendShip(_friendShip, decodedToken._id, {response: res, status: 200}),
                                  err => res.status(500).json({ code: err.code || 0, description: err.message }))

             }, err => res.status(500).json({ code: err.code || 0, description: err.message }))
    }
}

export function remove_friend(req, res){
    let {id, friendID} = req.params
    if(!Types.ObjectId.isValid(id)) return res.status(400).json({description: 'Required a valid \'id\''})
    if(!Types.ObjectId.isValid(friendID)) return res.status(400).json({description: 'Required a valid \'friendID\''})

    const decodedToken: DecodedTokenType | false = getRestrictedUser(req, res, {
        operation: Operation.DELETE,
        subject: Subject.FRIEND,
        others: decodedToken => decodedToken._id !== id
    })

    if(decodedToken) {

        Friend.deleteOne({ $or: [ { from: { $eq: id }, to: { $eq: friendID } }, { from: { $eq: friendID }, to: { $eq: id } }] })
              .where('state').ne(FriendShip.State.PENDING)
              .then((result) => {
                  console.debug(result)
                  if(result.n === 0) return res.status(404).json({ description: 'FriendShip is not found.' })
                  if(result.deletedCount === 0) return res.status(500).json({description: 'FriendShip is found but not delete.'})
                  return res.status(200).json({ description: 'Friendship is over.' })
              }, err => res.status(500).json({ code: err.code || 0, description: err.message }))

    }
}