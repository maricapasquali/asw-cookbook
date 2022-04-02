

export default  {
    request({rootState}, email){
        return this.$api.users.sendEmailResetPassword(email)
    },
    make({commit, rootState}, {userID, newPassword, accessToken}){
        return this.$api.users.changeOldPassword(userID, {new_hash_password: newPassword}, accessToken, true)
            .then(response =>{
                commit('unset-info')
                return response
            })
            .catch(err => {
                if(err.response?.status === 401) commit('unset-info')
                return err
            })
    },
    ['check-link']({rootState}, key){
        return this.$api.users.checkLinkResetPassword(key)
    },
    ['exist-with-username']({commit, rootState}, {userID, key}){
        return this.$api.users.getUserFromNickname(userID, key)
            .then(response => {
                const accessToken = response.data.temporary_token
                const  _id = response.data._id
                commit('set-info', {accessToken, _id})
                return response
            })
    },
}