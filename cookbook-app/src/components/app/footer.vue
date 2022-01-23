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
      administratorEmail: `administrator@${require("@app/app.config.json").app_name.toLowerCase()}.com`,
      isMobileDevice: window.navigator.userAgent.toLowerCase().includes("mobi")
    }
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