<template>
  <div>
    <app-navigator class="sticky-top" v-if="navigatorVisibility"/>
    <router-view :class="classObject"></router-view>
    <app-footer class="sticky-bottom" v-if="footerVisibility" />
  </div>
</template>

<script>
export default {
  name: 'App',
  data: function (){
    return {
      notNav: [undefined, 'login', 'end-signup', 'reset-password', 'reset-password', 'change-password'],
      notFooter: this.notNav
    }
  },
  computed:{
    navigatorVisibility: function (){
      return !this.notNav.includes(this.$route.name)
    },
    footerVisibility: function (){
      return this.navigatorVisibility //!this.notFooter.includes(this.$route.name)
    },
    classObject(){
      return {
        'mt-6': this.navigatorVisibility,
        'mb-8': this.navigatorVisibility
      }

    }
  }
}
</script>

<style lang="scss">
body{
  background-color: $background-color!important;
}
</style>
