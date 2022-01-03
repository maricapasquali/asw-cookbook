<template>
    <div v-if="authorized === true">
      <b-card no-body>
        <b-tabs content-class="mt-1" ref="tabs">
          <!-- BOTH -->
          <b-tab ref="account-tab" title="Account" class="p-3" @click="getInformation" lazy>
            <user-information :id="user" personal-area @onSessionExpired="sessionTimeout=true"/>
          </b-tab>
          <!-- SIGNED -->
          <b-tab v-if="isSigned" title="Ricette" @click="getRecipes" :active="isActive('recipes')" lazy>
            <recipe-sections @onSessionExpired="sessionTimeout=true"/>
          </b-tab>
          <!-- BOTH -->
          <b-tab title="Alimenti" @click="getFoods" :active="isActive('foods')" lazy>
            <food-section @onSessionExpired="sessionTimeout=true"/>
          </b-tab>
          <!-- ADMIN -->
          <b-tab v-if="isAdmin" title="Segnalazioni" @click="getReports" :active="isActive('reports')" lazy>
            <reports-section @onSessionExpired="sessionTimeout=true"/>
          </b-tab>
          <!-- ADMIN -->
          <b-tab v-if="isAdmin" title="Utenti" @click="getUsers" :active="isActive('users')" lazy>
            <users-section @onSessionExpired="sessionTimeout=true"/>
          </b-tab>
          <!-- SIGNED -->
          <b-tab v-if="isSigned" title="Amici" @click="getFriends" :active="isActive('friends')" lazy>
            <friends-section @onSessionExpired="sessionTimeout=true" />
          </b-tab>
          <!-- BOTH -->
          <b-tab title="Chats" @click="getChats" :active="isActive('chats')" lazy><p>Chats</p></b-tab>
          <!-- BOTH -->
          <b-tab title="Notifiche" @click="getNotifications" :active="isActive('notifications')" lazy>
            <notifications-section @onSessionExpired="sessionTimeout=true" />
          </b-tab>

        </b-tabs>
      </b-card>
    </div>
    <div v-else-if="error.show">
      <modal-alert v-model="error.show" variant="danger">
        <template v-slot:msg>
          <p>{{error.message}}</p>
          <router-link :to="{name: 'homepage'}" replace><b-button variant="primary">Vai alla HomePage</b-button></router-link>
        </template>
      </modal-alert>
    </div>
    <div v-else-if="authorized === false"><not-authorized-area/></div>
</template>

<script>
import api from "@api"
import {mapGetters, mapMutations} from "vuex";
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
      authorized: null,
      sessionTimeout: false,
      error:{
        show: false,
        message: ''
      },
      userRole: ''
    }
  },

  created(){
    console.log(`CHECK IF YOU IS AUTHORIZED ...`)
    if(this.accessToken){

      if(this.user === this.userIdentifier){
        this.socket.on('access-token:valid', this.onAccessTokenOk.bind(this))
        this.socket.on('access-token:not-valid', this.onAccessTokenNotOk.bind(this))
        this.socket.on('access-token:errors', this.onCheckAccessTokenError.bind(this))

        this.socket.emit('check:access-token', {_id: this.userIdentifier, resourceID: this.user})

      } else this.onCheckAccessTokenError({description: 'Non puoi accedere a questa pagina.'})

    } else this.$router.replace({name: 'login'});
  },
  beforeDestroy() {
    this.socket.off('access-token:valid', this.onAccessTokenOk.bind(this))
    this.socket.off('access-token:not-valid', this.onAccessTokenNotOk.bind(this))
    this.socket.off('access-token:errors', this.onCheckAccessTokenError.bind(this))
  },
  computed: {
    ...mapGetters(['accessToken', 'refreshToken', 'userIdentifier', 'socket', 'isSigned', 'isAdmin']),

    user(){
      return this.$route.params.id
    },

    loading: function (){
      return !(this.authorized || this.error.show || this.sessionTimeout)
    }
  },
  methods: {
    ...mapMutations(['endSession', 'setAccessToken']),

    isActive: function (target){
      return target === this.active
    },

    select: function (){
      switch (this.active){
        case 'account' : this.getInformation();break
        case 'recipes' : this.getRecipes();break
        case 'foods' : this.getFoods();break
        case 'friends' : this.getFriends();break
        case 'chats' : this.getChats();break
        case 'notification' : this.getNotifications();break
        case 'reports' : this.getReports();break
        case 'users' : this.getUsers();break
      }
    },

    navigate: function (dest){
      if(this.$route.name !== dest) this.$router.push({name:  dest})
    },

    getInformation: function (){
      this.navigate('p-user-account')
    },
    getRecipes: function (){
      this.navigate('p-user-recipes')
    },
    getFoods: function (){
      this.navigate('p-user-foods')
    },
    getFriends: function (){
      this.navigate('p-user-friends')
    },
    getChats: function (){
      this.navigate('p-user-chats')
    },
    getNotifications: function (){
      this.navigate('p-user-notifications')
    },

    getReports: function (){
      this.navigate('p-user-reports')
    },
    getUsers: function (){
      this.navigate('p-user-users')
    },

    /* Listeners check ACCESS TOKEN */

    onAccessTokenOk(){
      this.authorized = true
      this.select()
    },
    onAccessTokenNotOk(){
      console.error("Expired access token. Required another.")
      api.users
         .session
         .newAccessToken(this.userIdentifier, { refresh_token: this.refreshToken }, this.accessToken)
         .then(({data}) => {
           this.setAccessToken(data.access_token)
           this.authorized = true
           this.select()
         })
         .catch(error =>{
            this.authorized = false
            console.error("UnAuthorized: ", error)
            this.endSession()
            this.$router.replace({ name: 'login' });
         })
    },
    onCheckAccessTokenError({description}){
      this.authorized = false
      console.error('UnAuthorized: ', description)
      this.error = {
        show: true,
        message: description
      }
    }

  },
}
</script>

<style scoped>

</style>