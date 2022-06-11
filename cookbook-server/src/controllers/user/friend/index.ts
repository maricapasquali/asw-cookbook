import {Chat, Friend} from "../../../models";
import {Types} from "mongoose";
import {DecodedTokenType} from "../../../libs/jwt.token";
import {FriendShip, FriendShipPopulateOptions, IFriend} from "../../../models/schemas/user/friend";
import {MongooseDuplicateError, MongooseValidationError} from "../../../libs/custom.errors";
import {IChat} from "../../../models/schemas/chat";
import {Pagination} from "../../../libs/pagination";


function sendPopulateFriendShip(friendShip: IFriend, me: string, responseOptions: {response: any, status: number}) {
    friendShip.populate(FriendShipPopulateOptions, function (err, populateFriend){
        if(err) return responseOptions.response.status(500).json({description: err.message})
        return responseOptions.response.status(responseOptions.status).json(populateFriend)
    })
}

export function request_friendship(req, res){
    const {id} = req.params
    const decodedToken = req.locals.user

    Friend.findOne()
          .where('from').equals(id)
          .where('to').equals(decodedToken._id)
          .then((result) => {
              if(result) return res.status(409).json({description: 'Request has already been exist. ', actualState: result.state})
              new Friend({ from: decodedToken._id, to: id })
                  .save()
                  .then(_friendShip => sendPopulateFriendShip(_friendShip, decodedToken._id, {response: res, status: 201}),
                      err => {
                          if(MongooseValidationError.is(err)) return res.status(400).json({ description: err.message })
                          if(MongooseDuplicateError.is(err)) return res.status(409).json({description: 'Request has already been sent. '})
                          return res.status(500).json({code: err.code || 0, description: err.message})
                      }
                  )
          }, err => res.status(500).json({code: err.code || 0, description: err.message}))

}

export function list_friends(req, res){
    const {id} = req.params
    const {page, limit, userID} = req.query
    const {filters, populatePipeline} = req.locals

    Friend.find(filters)
        .populate(populatePipeline)
        .then((friends) =>{
            let mapperItems = friends.filter(friend => !( (!friend.from && friend.to?._id == id) || (!friend.to && friend.from?._id == id) ) )
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

            return res.status(200).json(Pagination.ofArray(mapperItems, page && limit ? { page: +page, limit: +limit } : undefined))

        }, err => res.status(500).json({code: err.code || 0, description: err.message}))
}

export function update_friendship(req, res){
    const {id, friendID} = req.params
    const {state} = req.body
    const decodedToken: DecodedTokenType = req.locals.user

    Friend.findOne()
        .where('to').equals(id)
        .where('from').equals(friendID)
        .then(friendship => {
            if(!friendship) return res.status(404).json('FriendShip is not found.')

            if(!FriendShip.State.isPending(friendship.state))
                return res.status(409).json({ description: 'State friendship has already been changed.', actualState: friendship.state})

            friendship.state = state
            friendship.updatedAt = Date.now()

            friendship.save()
                .then(_friendShip => sendPopulateFriendShip(_friendShip, decodedToken._id, {response: res, status: 200}),
                    err => res.status(500).json({ code: err.code || 0, description: err.message }))

        }, err => res.status(500).json({ code: err.code || 0, description: err.message }))
}

export function remove_friend(req, res){
    const {id, friendID} = req.params
    const decodedToken: DecodedTokenType = req.locals.user

    Friend.deleteOne({ $or: [ { from: { $eq: id }, to: { $eq: friendID } }, { from: { $eq: friendID }, to: { $eq: id } }] })
        .where('state').ne(FriendShip.State.PENDING)
        .then((result) => {
            console.debug(result)
            if(result.n === 0) return res.status(404).json({ description: 'FriendShip is not found.' })
            if(result.deletedCount === 0) return res.status(500).json({description: 'FriendShip is found but not delete.'})
            remove_chat_between(friendID, decodedToken._id)
            return res.status(200).json({ description: 'Friendship is over.' })
        }, err => res.status(500).json({ code: err.code || 0, description: err.message }))
}

function remove_chat_between(friend: string, me: string){
    Chat.findOne({ 'users.user': { $all: [ Types.ObjectId(friend), Types.ObjectId(me) ] } })
        .where('info.type').equals(IChat.Type.ONE)
        .then(chat => {
            if(!chat) return console.debug('FriendShip - Remove chat : chat not found')
            const exitedAt  = Date.now();
            chat.users.forEach(r => {
                r.role = IChat.Role.READER
                r.exitedAt = exitedAt
            })
            chat.save().then(data => console.debug('remove chat ',data._id), err => console.error('FriendShip: remove chat : err = ', err))
        }, err => console.error('FriendShip: remove chat', err))
}
