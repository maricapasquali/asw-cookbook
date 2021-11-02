<template>
  <!--TODO: FOOTER APP -->
  <footer v-if="!isMobileDevice"/>
</template>

<script>
export default {
  name: "app-footer",
  data(){
    return {
      isMobileDevice: window.navigator.userAgent.toLowerCase().includes("mobi")
    }
  }
}
</script>

<style scoped lang="scss">

footer{
  background-color:  $footer-color!important;
  z-index: 1;
}
</style>