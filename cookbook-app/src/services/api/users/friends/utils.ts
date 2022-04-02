import {clone} from "../../../../utils";

type FriendShip = { from?: any, to?: any, user?: any } | any

export function mapping(friendship: FriendShip, me: string): { user: { userID: string } } | any {
    let _friendship: FriendShip = clone(friendship)
    if(!friendship.from || friendship.from._id === me) _friendship.user = _friendship.to
    else if(!friendship.to || friendship.to._id === me) _friendship.user = _friendship.from
    delete _friendship.from
    delete _friendship.to
    return _friendship
}
