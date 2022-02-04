<template>
  <b-skeleton-wrapper :loading="loading">
    <template #loading>
      <b-card no-body>
        <b-tabs content-class="mt-1" ref="tabs">
          <b-tab v-for="i in skeleton" :key="i">
            <template #title>
              <div style="width: 100px"><b-skeleton width="100%"/></div>
            </template>
            <b-container>
              <b-row cols="1" class="text-center py-5" style="height: 500px">
                <b-col class="text-center" align-self="center"><b-spinner variant="primary" /></b-col>
              </b-row>
            </b-container>
          </b-tab>
        </b-tabs>
      </b-card>
    </template>
    <b-card no-body>
      <b-tabs v-model="currentTab" content-class="mt-1" ref="tabs" lazy>
        <b-tab v-for="tab in tabs" :key="tab.id" :title="tab.title" @click="tab.click" :active="tab.selected">
          <!-- BOTH -->
          <user-information v-if="isAccountTab" :id="user" personal-area />
          <!-- SIGNED -->
          <recipe-sections v-if="isRecipesTab"  />
          <!-- BOTH -->
          <food-section v-if="isFoodsTab"/>
          <!-- ADMIN -->
          <reports-section v-if="isReportsTab" />
          <!-- ADMIN -->
          <users-section v-if="isUsersTab" />
          <!-- SIGNED -->
          <friends-section v-if="isFriendsTab" />
          <!-- BOTH -->
          <chats-section v-if="isChatsTab" />
          <!-- BOTH -->
          <notifications-section v-if="isNotificationsTab" />
        </b-tab>
      </b-tabs>
    </b-card>
  </b-skeleton-wrapper>
</template>

<script>
import api from "@api"
import {mapActions, mapGetters} from "vuex";

export default {
  name: "PersonalArea",
  props:{
    active: {
      type: String,
      default: 'account',
      enum: ['account', 'recipes', 'foods', 'friends', 'chats', 'notifications', 'reports', 'users']
    }
  },
  data: function (){
    return {
      loading: false,
      skeleton: 4,

      currentTab: 0,
      reloadCurrentTab: false,

      tabs: [],
      tabsSigned: ['account', 'recipes', 'foods', 'friends', 'chats', 'notifications'],
      tabsAdmin: ['account', 'foods',  'reports', 'users','chats', 'notifications' ]
    }
  },
  created() {
    (this.isAdmin ? this.tabsAdmin : this.isSigned ? this.tabsSigned: [])
        .forEach(tab => this.tabs.push(this._mapping(tab)))
  },
  mounted(){
    console.log(`CHECK IF YOU IS AUTHORIZED ...`)
    if(this.accessToken){

      if(this.user === this.userIdentifier){

        this.currentTab = this.tabs.findIndex(t => t.id === this.active)

        this.socket.on('access-token:not-valid', this.onAccessTokenNotOk.bind(this))
        this.socket.on('access-token:errors', api.users.HandlerErrors.session.checkAccessToken.bind(this))

        this.socket.emit('check:access-token', {_id: this.userIdentifier, resourceID: this.user})

      } else api.users.HandlerErrors.session.wrongUserSession()

    } else this.$router.replace({name: 'login'});
  },
  beforeDestroy() {
    this.socket.off('access-token:not-valid', this.onAccessTokenNotOk.bind(this))
    this.socket.off('access-token:errors', api.users.HandlerErrors.session.checkAccessToken.bind(this))
  },
  computed: {
    ...mapGetters(['accessToken', 'refreshToken', 'userIdentifier', 'socket', 'isSigned', 'isAdmin']),

    user(){
      return this.$route.params.id
    },

    isAccountTab(){
      return this._isActive('account')
    },
    isRecipesTab(){
      return this._isActive('recipes')
    },
    isFoodsTab(){
      return this._isActive('foods')
    },
    isReportsTab(){
      return this._isActive('reports')
    },
    isUsersTab(){
      return this._isActive('users')
    },
    isFriendsTab(){
      return this._isActive('friends')
    },
    isChatsTab(){
      return this._isActive('chats')
    },
    isNotificationsTab(){
      return this._isActive('notifications')
    },
  },
  methods: {
    ...mapActions(['requestNewAccessToken']),

    _mapping(id){
      return {
        id,
        title: this._title(id),
        selected: this._isActive(id),
        click: () => {
          this.$router.push({ name:  this._route(id) })
          this.loading = false
        }
      }
    },

    _title(target){
      switch (target){
        case 'account' : return 'Account'
        case 'recipes' : return 'Ricette'
        case 'foods' : return 'Cibo'
        case 'friends' : return 'Amici'
        case 'chats' : return 'Chats'
        case 'notifications' : return 'Notifiche'
        case 'reports' : return 'Segnalazioni'
        case 'users' : return 'Utenti'
      }
    },
    _route: function (target){
      switch (target){
        case 'account' : return 'p-user-account'
        case 'recipes' : return 'p-user-recipes'
        case 'foods' : return 'p-user-foods'
        case 'friends' : return 'p-user-friends'
        case 'chats' : return 'p-user-chats'
        case 'notifications' : return 'p-user-notifications'
        case 'reports' : return 'p-user-reports'
        case 'users' : return 'p-user-users'
      }
    },
    _isActive: function (target){
      return target === this.active
    },

    /* Listeners check ACCESS TOKEN */
    onAccessTokenNotOk({description}){
      console.error("Expired access token. Required another.")
      console.error(description)
      this.requestNewAccessToken()
    }
  },
}
</script>

<style scoped>

</style>