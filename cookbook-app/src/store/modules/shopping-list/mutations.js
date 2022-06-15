import Vue from "vue"

export default {
    set(state, shoppingList) {
        if (Array.isArray(shoppingList)) Vue.set(state, "points", shoppingList)
    },
    add(state, point) {
        state.points.unshift(point)
    },
    update(state, { pointID, checked }) {
        let shoppingListPoint = state.points.find(p => p._id === pointID)
        if (shoppingListPoint) Object.assign(shoppingListPoint, { checked })
    },
    remove(state, pointID) {
        let index = state.points.findIndex(p => p._id === pointID)
        if (index !== -1) state.points.splice(index, 1)
    },
    reset(state) {
        Vue.set(state, "points",[])
    }
}
