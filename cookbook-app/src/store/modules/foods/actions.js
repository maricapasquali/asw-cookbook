

export default  {
    all({dispatch, rootState, rootGetters}, {query, pagination, options}){
        let isLoggedIn = rootGetters['session/isLoggedIn']
        if(!isLoggedIn) return dispatch('sayNotLoggedIn', null, { root: true })
        return this._vm.$api.foods.getFoods(rootState.session.accessToken, query, pagination, options)
    },
    create({dispatch, rootState, rootGetters}, body){
        let isLoggedIn = rootGetters['session/isLoggedIn']
        if(!isLoggedIn) return dispatch('sayNotLoggedIn', null, { root: true })
        return this._vm.$api.foods.createFood(body, rootState.session.accessToken)
    },
    update({dispatch, rootState, rootGetters}, {_id, body}){
        let isLoggedIn = rootGetters['session/isLoggedIn']
        if(!isLoggedIn) return dispatch('sayNotLoggedIn', null, { root: true })
        return this._vm.$api.foods.updateFood(_id, body, rootState.session.accessToken)
    },
    filterByBarcode({dispatch, rootState, rootGetters}, barcodeNumber){
        return this._vm.$api.foods.getFoods(rootState.session.accessToken, {barcode: barcodeNumber})
    },
    filterByName({dispatch, rootState, rootGetters}, startWith){
        return this._vm.$api.foods.getFoods(rootState.session.accessToken, {name: startWith})
    },
    findById({dispatch, rootState, rootGetters}, foodID){
        return this._vm.$api.foods.getFood(foodID, rootState.session.accessToken)
    }
}
