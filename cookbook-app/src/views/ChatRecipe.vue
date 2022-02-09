<template>
  <not-authorized-area v-if="unauthorized"/>
  <one-recipe v-else v-model="recipe" />
</template>

<script>
import OneRecipe from './OneRecipe'
export default {
  name: "ChatRecipe",
  components: { 'one-recipe': OneRecipe },
  data() {
    return {
      recipe: false,
      unauthorized: null
    }
  },
  methods: {
    _getChat(){
      this.$store.dispatch('chats/one', this.$route.params.chat_id)
         .then(({data}) => {
            //console.debug('Users chat => ', data.users.map(r => r.user.userID).join(', '))
            this._getRecipe()
         })
         .catch(err => {
           console.error(err.response)
           this.unauthorized = true
         })
    },
    _getRecipe(){
      let {recipe_id} = this.$route.params;
      this.$store.dispatch('recipes/one', recipe_id)
         .then(({data}) => this.recipe = data)
         .catch(err => {
           console.error(err.response)
           this.recipe = null
         })
    }
  },
  created() {
    this._getChat()
  }
}
</script>

<style scoped>

</style>