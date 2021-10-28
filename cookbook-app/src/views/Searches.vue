<template>
  <!-- TODO: TEMPLATE SEARCHES -->
  <div v-if="searchRecipes">Ricerca RICETTE</div>
  <div v-else-if="searchUsers">Ricerca UTENTI</div>
  <div v-else><not-found/></div>
</template>

<script>
import NotFound from "./404";
export default {
  name: "Searches",
  components: {NotFound},
  computed:{
    searchRecipes: function (){
      return this.$route.params.what === 'recipes'
    },
    searchUsers: function (){
      return this.$route.params.what === 'users'
    }
  }
}
</script>

<style scoped>

</style>