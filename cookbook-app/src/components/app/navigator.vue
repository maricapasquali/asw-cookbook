<template>
  <div id="navigator-app">
    <loading v-model="logoutProcessing" fixed/>
    <!-- NAV BAR -->
    <b-navbar ref="navigator" toggleable="sm" type="dark" :class="classNavigator" fixed="top">
      <b-navbar-brand v-if="isGuestOrSigned" :to="{name: 'homepage'}" :active="isHomePageActive">{{ app_name }}</b-navbar-brand>
      <b-navbar-brand v-else :active="isHomePageActive">{{ app_name }} - AMMINISTRAZIONE</b-navbar-brand>

      <b-navbar-toggle target="nav-collapse">
        <template #default="{ expanded }">
          <font-awesome-icon v-if="expanded" icon="times" />
          <font-awesome-icon v-else icon="bars" />
        </template>
      </b-navbar-toggle>

      <b-collapse id="nav-collapse" is-nav>
        <b-navbar-nav>
          <b-nav-item-dropdown text="Ricerca" v-if="isGuestOrSigned" right>
            <b-dropdown-item :active="isSearchRecipesActive" :to="{name:'search', params: {what: 'recipes'}}">ricette</b-dropdown-item>
            <b-dropdown-item :active="isSearchUsersActive" :to="{name:'search', params: {what: 'users'}}">utenti</b-dropdown-item>
          </b-nav-item-dropdown>
        </b-navbar-nav>

        <!-- Right aligned nav items -->
        <b-navbar-nav class="ml-auto">
          <b-nav-item-dropdown v-if="isLoggedIn" right>
            <template #button-content>
              <b-avatar badge-left badge-top variant="none"  badge-variant="light">
                <template #badge>
                  <span> {{totalNotRead}} <span class="sr-only">notifiche e messaggi non letti</span></span>
                </template>
              </b-avatar>
              <em>{{ username }}</em>
            </template>
            <b-dropdown-item :active="isAccountActive" :to="{name: 'p-user-account', params: {id: userIdentifier }}">Account</b-dropdown-item>

            <b-dropdown-item v-if="isSigned" :active="isRecipesActive" :to="{name: 'p-user-recipes', params: {id: userIdentifier}, query: {tab: 'shared'}}">Ricette</b-dropdown-item>
            <b-dropdown-item v-if="isSigned" :active="isFoodsActive" :to="{name: 'p-user-foods', hash: '#shopping-list', params: {id: userIdentifier}}">Lista della spesa</b-dropdown-item>
            <b-dropdown-item v-if="isSigned" :active="isFriendsActive" :to="{name: 'p-user-friends', params: {id: userIdentifier}}">Amici</b-dropdown-item>
            <b-dropdown-item v-if="isAdmin" :active="isReportsActive" :to="{name: 'p-user-reports', params: {id: userIdentifier}}">Segnalazioni</b-dropdown-item>
            <b-dropdown-item v-if="isAdmin" :active="isFoodsActive" :to="{name: 'p-user-foods', params: {id: userIdentifier}}">Alimenti</b-dropdown-item>
            <b-dropdown-item v-if="isAdmin" :active="isUsersActive" :to="{name: 'p-user-users', params: {id: userIdentifier}}">Utenti</b-dropdown-item>

            <b-dropdown-item :active="isNotificationsActive" :to="{name: 'p-user-notifications', params: {id: userIdentifier}}">
             <b-row>
               <b-col cols="6">
                 <span>Notifiche</span>
               </b-col>
               <b-col class="text-right px-1"  cols="6">
                 <h5><b-badge :variant="isNotificationsActive ? 'light': 'primary'"  v-if="unreadNotifications>0">{{unreadNotifications}}<span class="sr-only">notifiche non lette</span></b-badge></h5>
               </b-col>
             </b-row>
            </b-dropdown-item>
            <b-dropdown-item :active="isChatsActive" :to="{name: 'p-user-chats', params: {id: userIdentifier}}">
              <b-row>
                <b-col cols="6">
                  <span>Chats</span>
                </b-col>
                <b-col class="text-right px-1"  cols="6">
                  <h5><b-badge :variant="isChatsActive ? 'light': 'primary'"  v-if="unreadChatsMessages>0">{{unreadChatsMessages}}<span class="sr-only">messaggi non letti</span></b-badge></h5>
                </b-col>
              </b-row>
            </b-dropdown-item>
            <b-dropdown-item @click="onLogoutSubmit">Sign Out</b-dropdown-item>

          </b-nav-item-dropdown>
          <b-nav-item v-else :to="{name: 'login'}"> Login </b-nav-item>
        </b-navbar-nav>
      </b-collapse>
    </b-navbar>
  </div>
</template>

<script>

import {mapActions, mapGetters} from 'vuex'

export default {
  name: "app-navigator",
  data: function (){
    return {
      logoutProcessing: false
    }
  },

  computed:{
    ...mapGetters({
      isLoggedIn: 'session/isLoggedIn',
      userIdentifier: 'session/userIdentifier',
      username: 'session/username',
      isAdmin: 'session/isAdmin',
      isSigned: 'session/isSigned',
      isGuestOrSigned: 'session/isGuestOrSigned',
      unreadChatsMessages: 'chats/unreadChatsMessages',
      unreadNotifications:  'notifications/numberUnreadNotifications'
    }),

    totalNotRead(){
      return this.unreadNotifications + this.unreadChatsMessages
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
    isFriendsActive: function (){
      return this.$route.name === 'p-user-friends'
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

    classNavigator(){
      return { 'navigator-bar': true, 'navigator-bar-in-logout': this.logoutProcessing }
    }
  },
  methods:{
    ...mapActions({
      logout: 'session/logout'
    }),
    onLogoutSubmit(){
      this.logoutProcessing = true
      this.logout()
          .then(() => this.$socket.emit('logout'))
          .catch(this.handleRequestErrors.session.logout)
          .finally(() => this.logoutProcessing = false)
    }
  }
}
</script>

<style scoped lang="scss">
.navigator-bar{
  background-color: $nav-color;
}
.navigator-bar.navigator-bar-in-logout {
  z-index: 2!important;
}

.nav-notification {
  position: relative;
  & .badge {
    position: absolute;
    top: -3px;
    left: 12px;
  }
}

</style>
