import Vue from "vue"

export default {
    ["set-onlines"](state, users) {
        if (Array.isArray(users)) Vue.set(state, "_onlines", users.map(u => u || "anonymous"))
        console.debug("Users online are ", JSON.stringify(state._onlines))
    },
    ["add-online"](state, _id) {
        let userID = _id || "anonymous"
        let index = state._onlines.findIndex(id => id === _id)
        if (index === -1) {
            state._onlines.push(userID)
            if (_id) delete state._offline[_id]
        }
        console.debug("User ", userID, " is online.")
        console.debug("Onlines ", JSON.stringify(state._onlines))
    },
    ["remove-online"](state, { _id, _date }) {
        let userID = _id || "anonymous"
        let index = state._onlines.findIndex(id => id === userID)
        if (index !== -1) {
            state._onlines.splice(index, 1)
            if (_id && _date) state._offline[_id] = _date
        }
        console.debug("User ", userID, " is offline.")
        console.debug("Onlines ", JSON.stringify(state._onlines), ", Offlines ", JSON.stringify(state._offline))
    }
}
