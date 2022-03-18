<template>
  <not-found v-if="notFound.show" :asset="notFound.asset" />
  <one-recipe v-else v-model="recipe" />
</template>

<script>
import OneRecipe from './user-area/OneRecipe'
import NotFound from "./404";
export default {
  name: "ChatRecipe",
  components: {
    'one-recipe': OneRecipe,
    NotFound
  },
  data() {
    return {
      recipe: false,
      notFound: {
        show: false,
        asset: ''
      }
    }
  },
  methods: {
    _getChat(){
      this.$store.dispatch('chats/one', { chatID: this.$route.params.chat_id })
          .then(this._getRecipe)
          .catch(this.handleRequestErrors.chats.getChat)
          .then(_notFound => this.notFound = { show: _notFound, asset: 'chat' })
    },
    _getRecipe(){
      let {recipe_id} = this.$route.params;
      this.$store.dispatch('recipes/one', { recipeID: recipe_id })
         .then(({data}) => {
           this.recipe = data
         })
         .catch(err => {
           this.recipe = null
           this.handleRequestErrors.chats.getRecipeOnChat(err)
         })
         .then(_notFound => this.notFound = { show: _notFound, asset: 'recipe' })
    }
  },
  created() {
    this._getChat()
  }
}
</script>

<style scoped>

</style>
