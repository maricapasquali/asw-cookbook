

export default  {
    request({}, email){
        return this._vm.$api.users.sendEmailResetPassword(email)
    },
    make({commit}, {userID, newPassword, accessToken}){
        return this._vm.$api.users.changeOldPassword(userID, {new_hash_password: newPassword}, accessToken, true)
            .then(response =>{
                commit('unset-info')
                return response
            })
            .catch(err => {
                if(err.response?.status === 401) commit('unset-info')
                return err
            })
    },
    ['check-link']({}, key){
        return this._vm.$api.users.checkLinkResetPassword(key)
    },
    ['exist-with-username']({commit}, username){
        return this._vm.$api.users.getUserFromNickname(username)
            .then(response => {
                const accessToken = response.data.temporary_token
                const  _id = response.data._id
                commit('set-info', {accessToken, _id})
                return response
            })
    },
}