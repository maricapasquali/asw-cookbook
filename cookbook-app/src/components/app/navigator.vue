<template>
  <div id="navigator-app">
    <!-- NAV BAR -->
    <b-navbar ref="navigator" toggleable="lg" type="dark" class="navigator-bar">
      <b-navbar-brand href="#">{{ app_name }}</b-navbar-brand>

      <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

      <b-collapse id="nav-collapse" is-nav>
        <b-navbar-nav>
          <b-nav-item :active="isHomePageActive" :to="{name: 'homepage'}" > HomePage </b-nav-item>
          <b-nav-item-dropdown text="Ricerca" right>
            <b-dropdown-item :active="isSearchRecipesActive" :to="{name:'search', params: {what: 'recipes'}}">ricette</b-dropdown-item>
            <b-dropdown-item :active="isSearchUsersActive" :to="{name:'search', params: {what: 'users'}}">utenti</b-dropdown-item>
          </b-nav-item-dropdown>
        </b-navbar-nav>

        <!-- Right aligned nav items -->
        <b-navbar-nav class="ml-auto">
          <b-nav-item-dropdown v-if="isLoggedIn" right>
            <template #button-content>
              <em>{{ userInfo.userID }}</em>
            </template>
            <b-dropdown-item :active="isAccountActive" :to="{name: 'p-user-account', params: {id: userInfo._id}}">Account</b-dropdown-item>

            <b-dropdown-item v-if="userInfo.isSigned" :active="isRecipesActive" :to="{name: 'p-user-recipes', params: {id: userInfo._id}, query: {tab: 'shared'}}">Ricette</b-dropdown-item>
            <b-dropdown-item v-if="userInfo.isSigned" :active="isFoodsActive" :to="{name: 'p-user-foods', params: {id: userInfo._id}}">Lista della spesa</b-dropdown-item>

            <b-dropdown-item v-if="userInfo.isAdmin" :active="isReportsActive" :to="{name: 'p-user-reports', params: {id: userInfo._id}}">Segnalazioni</b-dropdown-item>
            <b-dropdown-item v-if="userInfo.isAdmin" :active="isFoodsActive" :to="{name: 'p-user-foods', params: {id: userInfo._id}}">Alimenti</b-dropdown-item>
            <b-dropdown-item v-if="userInfo.isAdmin" :active="isUsersActive" :to="{name: 'p-user-users', params: {id: userInfo._id}}">Utenti</b-dropdown-item>

            <b-dropdown-item :active="isNotificationsActive" :to="{name: 'p-user-notifications', params: {id: userInfo._id}}">Notifiche</b-dropdown-item>
            <b-dropdown-item :active="isChatsActive" :to="{name: 'p-user-chats', params: {id: userInfo._id}}">Chats</b-dropdown-item>
            <b-dropdown-item @click="logout">Sign Out</b-dropdown-item>

          </b-nav-item-dropdown>
          <b-nav-item v-else :to="{name: 'login'}"> Login </b-nav-item>

        </b-navbar-nav>
      </b-collapse>
    </b-navbar>
    <!-- LOADING OVERLAY -->
    <loading v-model="processing" /> <!-- FIXME: loading nav bar -->
    <!-- ERRORS MODAL -->
    <modal-alert v-model="error.show" variant="danger">
      <template v-slot:msg>
        {{error.message}}
      </template>
    </modal-alert>
  </div>
</template>

<script>

import api from '@api'
import {Session} from "@services/session";
import {bus} from "@/main";

export default {
  name: "app-navigator",
  data: function (){
    return {
      app_name : require("@app/app.config.json").app_name,
      userInfo:  {
        _id: null,
        userID: null,
        isSigned: null,
        isAdmin: null
      },
      access_token: null,
      processing: false,
      error: {
        show: false,
        message: ''
      }
    }
  },
  created() {
    this.userInfo = Session.userInfo()
    this.access_token = Session.accessToken()
    bus.$on('userID', this.userId.bind(this))
    bus.$on('session-start', this.startSession.bind(this))
    bus.$on('session-end', this.endSession.bind(this))
  },

  computed:{
    isLoggedIn: function (){
      return this.access_token !== null && this.userInfo.userID !== null
    },

    isHomePageActive: function (){
      return this.$route.name === 'homepage'
    },
    isSearchRecipesActive: function (){
      return this.$route.name === 'search' && this.$route.params.what === 'recipes'
    },
    isSearchUsersActive: function (){
      return this.$route.name === 'search' && this.$route.params.what === 'users'
    },
    isAccountActive: function (){
      return this.$route.name === 'p-user-account'
    },
    isRecipesActive: function (){
      return this.$route.name === 'p-user-recipes'
    },
    isFoodsActive: function (){
      return this.$route.name === 'p-user-foods'
    },
    isReportsActive: function (){
      return this.$route.name === 'p-user-reports'
    },
    isUsersActive: function (){
      return this.$route.name === 'p-user-users'
    },
    isNotificationsActive: function (){
      return this.$route.name === 'p-user-notifications'
    },
    isChatsActive: function (){
      return this.$route.name === 'p-user-chats'
    },

  },
  methods:{
    userId: function (userID){
      console.debug('change UserID (nav bar): ', userID)
      // this.userInfo.userID = userID
      Session.changeUserID(userID)
    },
    startSession: function (session){
      console.debug('session start (nav bar) : ', session)
      this.access_token = session.token
      // this.userInfo.userID = session.userID
    },
    endSession: function (){
      Session.end()
      this.access_token = null
      this.userInfo = {
        _id: null,
        userID: null,
        isSigned: null,
        isAdmin: null
      }
      console.debug("LOGOUT OK.")
    },

    logout: function (){
      this.processing = true
      console.log(this.userInfo._id)
      api.users.logout(this.userInfo._id, Session.accessToken())
               .then(response => {
                 this.endSession()
                 if(this.$route.name === 'homepage') this.$router.go()
                 else this.$router.replace({name: 'homepage'})
               })
               .catch(err => {
                 this.error.message = api.users.HandlerErrors.logout(err)
                 if(err.response.status === 409){
                   this.endSession()
                 }else{
                   this.error.show = true
                 }
               })
               .then(() => this.processing = false)
    }
  }
}
</script>

<style scoped lang="scss">
.navigator-bar{
  background-color: $nav-color;
}
</style>