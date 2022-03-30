import {clone} from "../../../utils";

export function mapping(friendship: any, me: string): { user: { userID: string } } | any {
    let _friendship = clone(friendship)
    if(!friendship.from || friendship.from._id === me) _friendship.user = _friendship.to
    else if(!friendship.to || friendship.to._id === me) _friendship.user = _friendship.from
    delete _friendship.from
    delete _friendship.to
    return _friendship
}