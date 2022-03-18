export default function (bus) {
    function unlikeRecipe({recipeID, likeID}){
        bus.$emit('unlike:recipe', recipeID, likeID)
    }

    function unlikeComment({commentID, likeID}){
        bus.$emit('unlike:comment', commentID, likeID)
    }

    function updateFood(food){
        bus.$emit('food:update', food)
    }

    function updateComment(comment){
        bus.$emit('comment:update', comment)
    }

    function deleteComment(commentID){
        bus.$emit('comment:delete', commentID)
    }

    function unReportComment(commentID){
        bus.$emit('comment:unreport', commentID)
    }

    function signupUser(user){
        bus.$emit('user:signup', user)
    }

    function checkUser(user){
        bus.$emit('user:checked', user)
    }

    function updateInfoUser(user_info){
        bus.$emit('user:update:info', user_info)
        // if it is my friend
        this.$store.commit('friendships/update-user-info', user_info)
    }

    function deleteUser(id){
        console.debug('deleted user : ', id)
        if(this.$store.getters["session/userIdentifier"] === id){
            this.$store.dispatch("reset")
            this.$router.replace({name: "homepage"})
        } else {
            bus.$emit('user:delete', id)
            // if it is my friend
            this.$store.commit('friendships/remove', id)
        }
    }


    return {
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