export default function (bus){

    const options = {
        title: 'Ricette',
        solid: true
    }

    function _operationOnRecipe(op, notification, data){
        console.debug('recipe ', op , ' => ', { notification, data })
        if(notification) {
            this.$bvToast.toast(notification.content, options)
            this.$store.commit('notifications/add-unread')
        }
        bus.$emit('recipe:' + op, notification, data)
    }

    function recipeComment({notification, comment}) {
        _operationOnRecipe.bind(this)('comment', notification, comment)
    }

    function createSharedRecipe({notification, recipe}) {
        _operationOnRecipe.bind(this)('create', notification, recipe)
    }

    function createSavedRecipe({notification, recipe}) {
        _operationOnRecipe.bind(this)('create:saved', notification, recipe)
    }

    function updateSharedRecipe({notification, recipe}) {
        _operationOnRecipe.bind(this)('update', notification, recipe)
    }

    function deleteSharedRecipe({notification, recipe}) {
        _operationOnRecipe.bind(this)('delete', notification, recipe)
    }

    return {
        recipeComment,
        createSharedRecipe,
        createSavedRecipe,
        updateSharedRecipe,
        deleteSharedRecipe
    }

}
