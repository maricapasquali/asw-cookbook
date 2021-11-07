<template>
  <!--TODO: FOOTER APP -->
  <footer/>
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
  z-index: 3;
  height: 80px;
  bottom: 0;
  width: 100%;
}
</style>