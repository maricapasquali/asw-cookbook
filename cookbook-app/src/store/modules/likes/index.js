import actions from "./actions";
import mutations from "./mutations";

export default {
    namespaced: true,
    state: {
        anonymousLikeOnRecipe: [],
        anonymousLikeOnComment: [],
    },
    actions,
    mutations
}