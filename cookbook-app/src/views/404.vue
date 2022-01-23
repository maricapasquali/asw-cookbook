<template>
  <b-container fluid="sm">
    <b-row cols="1" align-v="center" class="vh-100">
        <b-card>
          <b-card-body class="text-center">
           <b-container fluid>
             <b-row cols="1" class="text-center">
               <img width="150" height="150" :src="image" :alt="alt" />
               <router-link :to="{name: 'homepage'}" replace><b-button>Vai alla HomePage</b-button></router-link>
             </b-row>
           </b-container>
          </b-card-body>
        </b-card>
    </b-row>
  </b-container>
</template>

<script>
import {bus} from "@/main";

export default {
  name: "NotFound",
  props: {
    asset: String
  },
  computed: {
    alt(){
      switch (this.asset){
        case 'recipe':
          return 'Recipe Not Found'
        case 'user':
          return 'User Not Found'
        case 'chat':
          return 'Chat Not Found'
        default:
          return 'Page Not Found'
      }
    },
    image(){
      switch (this.asset){
        case 'recipe':
          return require('@assets/images/404-recipe.png')
        case 'user':
          return require('@assets/images/404-user.png')
        case 'chat':
          return require('@assets/images/404-chat.png')
        default:
          return require('@assets/images/404-page.png')
      }
    }
  },
  created() {
    bus.$emit('hideNavigationBar', this.$route.name)
  }
}
</script>

<style scoped>
img{
  object-fit: contain;
}
</style>