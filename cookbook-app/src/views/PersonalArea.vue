<template>
    <div v-if="authorized === true">
      <b-card no-body>
        <b-tabs content-class="mt-1" ref="tabs">
          <!-- BOTH -->
          <b-tab ref="account-tab" title="Account" class="p-3" @click="getInformation" lazy>
            <user-information :id="user" personal-area @onSessionExpired="sessionTimeout=true"/>
          </b-tab>
          <!-- SIGNED -->
          <b-tab v-if="isSignedUser" title="Ricette" @click="getRecipes" :active="isActive('recipes')" lazy>
            <recipe-sections @onSessionExpired="sessionTimeout=true"/>
          </b-tab>
          <!-- BOTH -->
          <b-tab title="Alimenti" @click="getFoods" :active="isActive('foods')" lazy>
            <food-section @onSessionExpired="sessionTimeout=true"/>
          </b-tab>
          <!-- ADMIN -->
          <b-tab v-if="isAdminUser" title="Segnalazioni" @click="getReports" :active="isActive('reports')" lazy>
            <reports-section @onSessionExpired="sessionTimeout=true"/>
          </b-tab>
          <!-- ADMIN -->
          <b-tab v-if="isAdminUser" title="Utenti" @click="getUsers" :active="isActive('users')" lazy>
            <users-section @onSessionExpired="sessionTimeout=true"/>
          </b-tab>
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
    <div v-else-if="authorized === false"><not-authorized-area/></div>
</template>

<script>
import {isString} from '@services/utils'
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
      api.users.isAuthorized(this.user, this.accessToken)
          .then(response =>{
            this.authorized = true
            this.userRole = response.data.isSigned ? 'signed' : response.data.isAdmin ? 'admin' : ''
            this.select()
          })
          .catch(error => {
            this.authorized = false
            this.error.message = api.users.HandlerErrors.isAuthorized(error);
            console.log(this.error.message)
            if(isString(this.error.message)){
              this.error.show = true
            }
            else if(error.response.status === 401){
              console.error("isAuthorized: Error 401")
              this.endSession()
              this.$router.replace({name: 'login'});
            }
          })
    }else {
      this.$router.replace({name: 'login'});
    }
  },
  computed: {
    ...mapGetters(['accessToken']),

    user(){
      return this.$route.params.id
    },

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
    ...mapMutations(['endSession']),

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