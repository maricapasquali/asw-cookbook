<template>
  <not-found
    v-if="notFound.show"
    :asset="notFound.asset"
  />
  <one-recipe
    v-else
    v-model="recipe"
  />
</template>

<script>
import OneRecipe from "./user-area/OneRecipe"
import NotFound from "./404"

export default {
    name: "ChatRecipe",
    components: {
        "one-recipe": OneRecipe,
        NotFound
    },
    data() {
        return {
            recipe: undefined,
            notFound: {
                show: false,
                asset: ""
            }
        }
    },
    created() {
        this._getChat()
    },
    methods: {
        _getChat() {
            this.$store.dispatch("chats/one", { chatID: this.$route.params.chatId })
                .then(this._getRecipe)
                .catch(this.$store.$api.errorsHandler.chats.getChat)
                .then(_notFound => this.notFound = { show: _notFound, asset: "chat" })
        },
        _getRecipe() {
            let { recipeId } = this.$route.params
            this.$store.dispatch("recipes/one", { recipeID: recipeId })
                .then(({ data }) => {
                    this.recipe = data
                })
                .catch(err => {
                    this.recipe = null
                    this.$store.$api.errorsHandler.chats.getRecipeOnChat(err)
                })
                .then(_notFound => this.notFound = { show: _notFound, asset: "recipe" })
        }
    }
}
</script>

<style scoped>

</style>
