export default function (bus){

    const options = {
        title: 'Ricette',
        solid: true
    }

    function _operationOnRecipe(op, notification, data){
        console.debug('recipe ', op , ' => ', { notification, data })
        if(notification) {
            this.$bvToast.toast(notification.content, options)
            this.$store.commit('addUnReadNotification')
        }
        bus.$emit('recipe:' + op, notification, data)
    }

    function recipeComment({notification, comment}) {
        _operationOnRecipe('comment', notification, comment)
    }

    function createSharedRecipe({notification, recipe}) {
        _operationOnRecipe('create', notification, recipe)
    }

    function updateSharedRecipe({notification, recipe}) {
        _operationOnRecipe('update', notification, recipe)
    }

    function deleteSharedRecipe({notification, recipe}) {
        _operationOnRecipe('delete', notification, recipe)
    }

    return {
        recipeComment,
        createSharedRecipe,
        updateSharedRecipe,
        deleteSharedRecipe
    }

}