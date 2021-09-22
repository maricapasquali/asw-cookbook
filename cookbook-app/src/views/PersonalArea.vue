<template>
  <div v-if="!loading">
    <div v-if="authorized">
      <b-card no-body>
        <b-tabs content-class="mt-1" ref="tabs">
          <!-- BOTH -->
          <b-tab ref="account-tab" title="Account" class="p-3" @click="getInformation" lazy>
            <user-information :id="$route.params.id" :access-token="accessToken" @onSessionExpired="sessionTimeout=true"/>
          </b-tab>
          <!-- SIGNED -->
          <b-tab v-if="isSignedUser" title="Ricette" @click="getRecipes" :active="isActive('recipes')" lazy><p>Ricette</p></b-tab>
          <!-- BOTH -->
          <b-tab title="Alimenti" @click="getFoods" :active="isActive('foods')" lazy><p>Alimenti</p></b-tab>
          <!-- ADMIN -->
          <b-tab v-if="isAdminUser" title="Segnalazioni" @click="getReports" :active="isActive('reports')" lazy><p>Segnalazioni</p></b-tab>
          <!-- ADMIN -->
          <b-tab v-if="isAdminUser" title="Utenti" @click="getUsers" :active="isActive('users')" lazy><p>Utenti</p></b-tab>
          <!-- SIGNED -->
          <b-tab v-if="isSignedUser" title="Amici" @click="getFriends" :active="isActive('friends')" lazy><p>Amici</p></b-tab>
          <!-- BOTH -->
          <b-tab title="Chats" @click="getChats" :active="isActive('chats')" lazy><p>Chats</p></b-tab>
          <!-- BOTH -->
          <b-tab title="Notifiche" @click="getNotifications" :active="isActive('notifications')" lazy><p>Notifiche</p></b-tab>

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
    <div v-else><not-authorized-area/></div>
  </div>
  <loading v-else v-model="loading"/>
</template>

<script>
import Utils from '@services/utils'
import api from "@api"
import {Session} from "@services/session";
import {bus} from "@/main"
export default {
  name: "PersonalArea",
  components: {Navigator},
  props:{
    active: {
      type: String,
      default: 'account',
      enum: ['account', 'recipes', 'foods', 'friends', 'chats', 'notifications', 'reports', 'users']
    }
  },
  data: function (){
    return {
      authorized: false,
      sessionTimeout: false,
      error:{
        show: false,
        message: ''
      },
      userRole: '',
      accessToken: ''
    }
  },

  created() {
    console.log(`CHECK IF YOU IS AUTHORIZED ...`)
    this.accessToken = Session.accessToken()
    if(this.accessToken){
      api.users.isAuthorized(this.$route.params.id, this.accessToken)
          .then(response =>{
            this.authorized = true
            this.userRole = response.data.isSigned ? 'signed' : response.data.isAdmin ? 'admin' : ''
            this.select()
          })
          .catch(error => {
            this.authorized = false
            this.error.message = api.users.HandlerErrors.isAuthorized(error);
            console.log(this.error.message)
            if(Utils.isString(this.error.message)){
              this.error.show = true
            }
            else if(error.response.status === 401){
              console.error("isAuthorized: Error 401")
              bus.$emit("session-end")
              this.$router.replace({name: 'login'});
            }
          })
    }else {
      this.$router.replace({name: 'login'});
    }
  },
  computed: {
    loading: function (){
      return !(this.authorized || this.error.show || this.sessionTimeout)
    },
    isAdminUser() {
      return this.userRole === 'admin'
    },
    isSignedUser() {
      return this.userRole === 'signed'
    }

  },
  methods: {
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
    }
  }
}
</script>

<style scoped>

</style>