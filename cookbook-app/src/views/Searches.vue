<template>
  <b-container fluid v-if="isGuestOrSigned && item">
    <b-row class="mx-auto"> <b-col class="mb-5"> <header> <h1>{{ item.title }}</h1> </header> </b-col> </b-row>
    <search-recipes v-if="item.isRecipes" with-map with-history with-all-filters-visible show-results/>
    <search-users v-else-if="item.isUsers"/>
  </b-container>
  <not-found v-else/>
</template>

<script>
import NotFound from "./404";

import {mapGetters} from "vuex";

export default {
  name: "Searches",
  components: {NotFound},
  computed:{
    ...mapGetters({
      isGuestOrSigned: 'session/isGuestOrSigned'
    }),

    item(){
      switch (this.$route.params.what){
        case 'recipes':
          return {
            title: 'Ricette',
            isRecipes: true
          }
        case 'users':
          return {
            title: 'Utenti',
            isUsers: true
          }
        default:
          return false
      }
    }
  }
}
</script>

<style scoped>

</style>