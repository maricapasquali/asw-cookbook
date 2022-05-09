<template>
  <footer class="text-center">
   <b-container class="h-100">
     <div><logo dark/></div>
     <div v-if="!isAdmin" class="py-2">
       <strong>Contatti: </strong>
       <b-link  class="mt-2" :href="`mailto:${administratorEmail}`"> {{ administratorEmail }} </b-link>
     </div>
     <span class="copy-right"> Copyright &copy; 2021-{{currentYear}} CookBook, Co. </span>
   </b-container>
  </footer>
</template>

<script>
import {mapGetters} from "vuex";

export default {
  name: "app-footer",
  computed: {
    ...mapGetters({
      isAdmin: 'session/isAdmin'
    }),
    currentYear(){
      return new Date(Date.now()).getFullYear()
    },
    administratorEmail(){
      return `administrator@${this.$appName.toLowerCase()}.com`
    }
  }
}
</script>

<style scoped lang="scss">

footer{
  background-color:  $footer-color!important;
  color: white;
  z-index: 3;
  bottom: 0;
  width: 100%;
  padding: 10px;

  .container {
    display: grid;
    .logo {
      height: 50px!important;
      border-radius: 8px;
    }

    a {
      color: white;
    }
  }
}
</style>