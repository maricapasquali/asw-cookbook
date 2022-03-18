<template>
  <!--TODO: FOOTER APP -->
  <footer class="text-center">
    <a class="mt-2" :href="`mailto:${administratorEmail}`"> Email amministratore </a>
  </footer>
</template>

<script>
export default {
  name: "app-footer",
  data(){
    return {
      isMobileDevice: window.navigator.userAgent.toLowerCase().includes("mobi")
    }
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