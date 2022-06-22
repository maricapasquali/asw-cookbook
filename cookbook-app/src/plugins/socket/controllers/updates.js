export default function (bus, store, router) {

    function addInShoppingList(point) {
        store.commit("shopping-list/add", point)
    }
    function updatePointInShoppingList(point) {
        store.commit("shopping-list/update", { pointID: point._id, checked: point.checked })
    }
    function removePointInShoppingList(pointID) {
        store.commit("shopping-list/remove", pointID)
    }

    function addRecipePermission({ recipe }) {
        bus.$emit("recipe:add:permission", recipe)
    }

    function unlikeRecipe({ recipeID, likeID }) {
        bus.$emit("unlike:recipe", recipeID, likeID)
    }

    function unlikeComment({ commentID, likeID }) {
        bus.$emit("unlike:comment", commentID, likeID)
    }

    function updateFood(food) {
        bus.$emit("food:update", food)
    }

    function updateComment(comment) {
        bus.$emit("comment:update", comment)
    }

    function deleteComment(commentID) {
        bus.$emit("comment:delete", commentID)
    }

    function unReportComment(commentID) {
        bus.$emit("comment:unreport", commentID)
    }

    function signupUser(user) {
        bus.$emit("user:signup", user)
    }

    function checkUser(user) {
        bus.$emit("user:checked", user)
    }

    function updateInfoUser(userInfo) {
        bus.$emit("user:update:info", userInfo)
        // if it is my friend
        store.commit("friendships/update-user-info", userInfo)
    }

    function deleteUser(id) {
        console.debug("deleted user : ", id)
        if (store.getters["session/userIdentifier"] === id) {
            store.dispatch("reset")
            router.replace({ name: "homepage" })
        } else {
            bus.$emit("user:delete", id)
            // if it is my friend
            store.commit("friendships/remove", id)
        }
    }


    return {
        addInShoppingList,
        updatePointInShoppingList,
        removePointInShoppingList,

        addRecipePermission,
        unlikeRecipe,
        unlikeComment,
        updateFood,
        updateComment,
        deleteComment,
        unReportComment,
        signupUser,
        checkUser,
        updateInfoUser,
        deleteUser
    }
}
