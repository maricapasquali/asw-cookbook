<template>
  <div>
    <app-navigator v-if="navigatorVisibility"/>
    <router-view :class="classObject" />
    <app-footer v-if="footerVisibility" />
    <loading v-model="processing" />
  </div>
</template>

<script>
import  {bus} from "@/main";
import {mapGetters, mapActions} from "vuex";

import notifications from "@/notifications";
import updates from "@/updates";
import {pushMessages} from '@components/chats/utils'

export default {
  name: 'App',
  data: function (){
    return {
      notNav: [undefined, 'login', 'end-signup', 'reset-password', 'reset-password', 'change-password', 'chat'],
      notFooter: this.notNav,
      processing: false
    }
  },
  computed:{
    ...mapGetters(['socket', 'userIdentifier', 'accessToken', 'isAdmin', 'isLoggedIn']),
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
  },
  methods: {
    onLogout(isLogout){
      console.debug('Logout = ', isLogout)
      this.processing = isLogout
    },
    hideNavigationBar(route){
      console.debug('Hide navigation bar on route ', route)
      this.notNav.push(route)
    },

    // NOTIFICATIONS
    ...mapActions(['getNumberOfUnReadNotifications']),
    ...notifications,
    //UPDATES
    ...updates,

    //MESSAGES
    pushMessages,
  },
  created() {
    this.$store.commit('setSession')
    // console.debug('App created ', this.$store.state)
    bus.$on('onLogout', this.onLogout.bind(this))
    bus.$on('hideNavigationBar', this.hideNavigationBar.bind(this))

    // NOTIFICATIONS
    if(this.isLoggedIn) this.getNumberOfUnReadNotifications()
    this.friendShipListeners()
    this.foodListeners()
    this.commentListeners()
    this.recipeListeners()
    this.userInfoListeners()
    this.likeListeners()

    //UPDATES
    this.updateListeners()

    //MESSAGES
    this.socket.on('push-messages', this.pushMessages.bind(this))
  }
}
</script>

<style lang="scss">
body{
  background-color: $background-color!important;
}
</style>
