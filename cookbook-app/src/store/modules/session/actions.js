

export default {
    login({ dispatch }, credential) {
        return this.$api.users
            .session
            .login(credential)
            .then(({ data }) => {
                let { token, userInfo } = data
                dispatch("initialization", { ...token, user: userInfo }, { root: true })
                    .then(() => console.debug("initialization on login ...") )
                    .catch(err => console.error("initialization error ", err))
                return {
                    location: {
                        name: data.firstLogin ? "change-password" : "p-user-account",
                        params: { id: userInfo._id, firstLogin: data.firstLogin ? true : undefined },
                    },
                    session: { ...token, user: userInfo }
                }
            })
    },

    logout({ dispatch, state, getters }) {
        if (!getters.isLoggedIn) return dispatch("sayNotLoggedIn", null, { root: true })
        return this.$api.users.session.logout(state.user._id, state.accessToken)
    },

    requestNewAccessToken({ commit, getters, dispatch, state }) {
        if (!getters.isLoggedIn) return dispatch("sayNotLoggedIn", null, { root: true })
        return this.$api.users
            .session
            .newAccessToken(state.user._id, { refresh_token: state.refreshToken }, state.accessToken)
            .then(response => {
                if (response.status === 200 && state.accessToken !== response.data.access_token) commit("set-access-token", response.data.access_token)
                if (response.status === 204) response.data = { access_token: state.accessToken }
                return response
            })
            .catch(error => {
                console.error(error.response || error.message)
                if (error.response && error.response.status === 401) dispatch("reset", null, { root: true })
                return error
            })
    },
}
