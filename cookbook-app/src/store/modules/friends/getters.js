import { mapping } from "@api/users/friends/utils"

export default {
    friends: state => state._friends,
    acceptedFriends: (state, getters, rootState) => state._friends
        .filter(friendship => friendship.state === "accepted")
        .map(friendship => mapping(friendship, rootState.session.user._id))

}