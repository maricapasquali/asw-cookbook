import Vue from "vue"

export default {
    ["set-info"](state, payload) {
        let { accessToken, _id } = payload || {}
        if (accessToken && _id) {
            localStorage.setItem("temp-token", accessToken)
            localStorage.setItem("temp-user-id", _id)
        } else {
            accessToken = localStorage.getItem("temp-token")
            _id = localStorage.getItem("temp-user-id")
        }
        Vue.set(state, "resetPassword" , {
            _temporaryAccessToken: accessToken,
            _temporaryUserIdentifier: _id
        })
        console.debug("Temporary access token = ", accessToken)
        console.debug("Temporary user _id = ", _id)
    },

    ["unset-info"](state) {
        localStorage.removeItem("temp-token")
        localStorage.removeItem("temp-user-id")
        Vue.set(state, "resetPassword" , {})
    }
}