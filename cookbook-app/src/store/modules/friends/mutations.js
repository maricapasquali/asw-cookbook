import Vue from "vue";

export default {
    set(state, friendships){
        if(Array.isArray(friendships)) Vue.set(state, '_friends', friendships)
    },
    add(state, friendship){
        state._friends.unshift(friendship)
    },
    remove(state, friendID){
        let index = state._friends.findIndex(f => (f.from._id === friendID || f.to._id === friendID))
        if(index !== -1) state._friends.splice(index, 1)
    },
    update(_state, {friendID, updatedFriendship}){
        let friendship = _state._friends.find(f => (f.from._id === friendID || f.to._id === friendID))
        if(friendship) Object.assign(friendship, updatedFriendship)
    },
    ['update-user-info'](_state, userInfo){
        let _id = userInfo._id
        let info = {...userInfo, ...userInfo.information}; delete info.information;
        let friendShip = _state._friends.find(f => (f.from._id === _id || f.to._id === _id))
        if(friendShip) {
            if(friendShip.from._id === _id) Object.assign(friendShip, {from: {...friendShip.from, ...info}})
            if(friendShip.to._id === _id) Object.assign(friendShip, {to: {...friendShip.to, ...info}})
            console.debug('Update info my friend : ', userInfo)
        }
    },
    reset(state){
        Vue.set(state, '_friends', [])
    }
}