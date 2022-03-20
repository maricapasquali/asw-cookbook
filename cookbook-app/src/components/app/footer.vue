<template>
  <!--TODO: FOOTER APP -->
  <footer class="text-center">
    <b-link v-if="!isAdmin" class="mt-2" :href="`mailto:${administratorEmail}`"> Email amministratore </b-link>
  </footer>
</template>

<script>
import {mapGetters} from "vuex";

export default {
  name: "app-footer",
  data(){
    return {
      isMobileDevice: window.navigator.userAgent.toLowerCase().includes("mobi")
    }
  },
  computed: {
    ...mapGetters({
      isAdmin: 'session/isAdmin'
    })
  },
  created() {
    this.administratorEmail = `administrator@${this.app_name.toLowerCase()}.com`
  }
}
</script>

<style scoped lang="scss">

footer{
  background-color:  $footer-color!important;
  z-index: 3;
  height: 80px;
  bottom: 0;
  width: 100%;
  padding: 10px;

  & a {
    color: white;
  }
}
</style>