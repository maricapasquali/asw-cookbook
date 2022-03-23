export default {
    list: state => state.points,
    in: (state) => (food) => {
        return !!state.points.find(p => p.food._id === food._id && p.checked === false)
    },
    findCheckedPoint: (state) => (foodID) => {
        return state.points.find(p => p.food._id === foodID && p.checked === true)
    },
    findUnCheckedPoint: (state) => (foodID) => {
        return state.points.find(p => p.food._id === foodID && p.checked === false)
    }
}