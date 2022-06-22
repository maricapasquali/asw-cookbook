

export default  {
    request(context, email) {
        return this.$api.users.sendEmailResetPassword(email)
    },
    make({ commit }, { userID, newPassword, accessToken }) {
        return this.$api.users.changeOldPassword(userID, { new_hash_password: newPassword }, accessToken, true)
            .then(response => {
                commit("unset-info")
                return response
            })
            .catch(err => {
                if (err.response?.status === 401) commit("unset-info")
                return err
            })
    },
    ["check-link"](context, key) {
        return this.$api.users.checkLinkResetPassword(key)
    },
    ["exist-with-username"]({ commit }, { userID, key }) {
        return this.$api.users.getUserFromNickname(userID, key)
            .then(response => {
                const accessToken = response.data.temporary_token
                const  _id = response.data._id
                commit("set-info", { accessToken, _id })
                return response
            })
    },
}
