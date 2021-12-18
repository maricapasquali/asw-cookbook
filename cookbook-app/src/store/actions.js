import api from '@api'

export default {
    getFriends({ commit, state }){
        if(state.user) {
            api.friends
                .getFriendOf(state.user._id, state.accessToken)
                .then(({data}) => {
                    console.debug(data.items)
                    commit('setFriend', data.items)
                })
                .catch(err => console.error(err))
        }
        else console.debug('Not logged.')
    }
}