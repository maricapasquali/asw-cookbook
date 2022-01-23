<template>
  <not-authorized-area v-if="unauthorized"/>
  <one-recipe v-else v-model="recipe" />
</template>

<script>
import api from '@api'
import OneRecipe from './OneRecipe'
import {mapGetters} from "vuex";
export default {
  name: "ChatRecipe",
  components: { 'one-recipe': OneRecipe },
  data() {
    return {
      recipe: false,
      unauthorized: null
    }
  },
  computed: { ...mapGetters(["userIdentifier", "accessToken"]) },
  methods: {
    _getChat(){
      api.chats
         .getChat(this.userIdentifier, this.$route.params.chat_id, this.accessToken)
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
      api.recipes
         .getRecipe(this.userIdentifier, recipe_id, null, this.accessToken)
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