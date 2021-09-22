<template>
  <div>
    <app-navigator v-if="navigatorVisibility"/>
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: 'App',
  data: function (){
    return {
      notNav: [undefined, 'login', 'end-signup', 'reset-password', 'reset-password', 'change-password']
    }
  },
  computed:{
    navigatorVisibility: function (){
      return !this.notNav.includes(this.$route.name)
    }
  }
}
</script>

<style lang="scss">
body{
  background-color: $background-color!important;
}
</style>
