<template>
  <div>
    <app-navigator v-if="navigatorVisibility"/>
    <router-view :class="classObject" />
    <app-footer v-if="footerVisibility" />

    <loading v-model="logoutOn" fixed/>

    <server-error-handler />
    <bad-request-error-handler />
    <unauthenticated-error-handler />
    <forbidden-error-handler />
    <not-found-error-handler />
  </div>
</template>

<script>
import  {bus} from "@/main";
import {mapGetters, mapActions, mapMutations} from "vuex";

import notifications from "@/notifications";
import updates from "@/updates";
import {pushMessages} from '@components/chats/utils'

export default {
  name: 'App',
  data: function (){
    return {
      notNav: [undefined, 'login', 'end-signup', 'reset-password', 'reset-password', 'change-password', 'chat'],
      notFooter: this.notNav
    }
  },
  computed:{
    ...mapGetters(['socket', 'userIdentifier', 'accessToken', 'isAdmin', 'isLoggedIn']),
    logoutOn(){
      return this.$store.state.logoutOn
    },
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
    hideNavigationBar(route){
      console.debug('Hide navigation bar on route ', route)
      this.notNav.push(route)
    },
    ...mapMutations(['setSession']),
    // NOTIFICATIONS
    ...mapActions(['getNumberOfUnReadNotifications', 'getNumberOfUnReadChatsMessages']),
    ...notifications,
    //UPDATES
    ...updates,

    //MESSAGES
    pushMessages,
  },
  created() {
    this.setSession()
    // console.debug('App created ', this.$store.state)
    bus.$on('hideNavigationBar', this.hideNavigationBar.bind(this))

    // NOTIFICATIONS
    if(this.isLoggedIn) {
      this.getNumberOfUnReadNotifications()
      this.getNumberOfUnReadChatsMessages()
    }
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
