<template>
 <center-container>
   <template v-slot:content>
     <loading v-model="processing"/>
     <div v-if="!processing">
       <b-card v-if="link.valid">
         <div class="text-center"> <h1 class="text-primary"><em>{{ app_name }}</em></h1><h3 v-if="changeDefaultPassword"><em>Cambia DEFAULT password</em></h3></div>
         <b-card-body>
           <b-alert variant="danger" v-model="error.show" show>
            <div>
              <div>{{error.msg}}</div>
              <div class="d-flex justify-content-end"><b-button  v-if="error.tryAgain" @click="tryAgain">Riprova</b-button></div>
            </div>
           </b-alert>
           <b-form @submit="change" >
             <b-form-group
                 v-if="!success.userID && !changeDefaultPassword"
                 id="input-group-1"
                 label="UserID"
                 label-for="input-1"
             >
               <b-form-input
                   id="input-1"
                   v-model.trim="userID"
                   :state="validation.userID"
                   @input="checkUserID"
                   type="text"
                   placeholder="Enter userID"
                   @keypress.enter="checkUser"
                   required
               ></b-form-input>
             </b-form-group>
             <input-password v-if="success.userID" @inputPassword="hash_password=$event" @checkPassword="validation.password=$event"/>
             <b-container>
               <b-row v-if="changeDefaultPassword" cols="2" class="d-flex justify-content-between">
                 <b-col class="pl-0" >
                   <b-button  variant="secondary" @click="$router.replace({name: 'homepage'})">Salta</b-button>
                 </b-col>
                 <b-col class="pr-0 text-right" >
                   <b-button v-if="success.userID && validation.password" type="button" variant="primary" @click="change">Cambia</b-button>
                 </b-col>
               </b-row>
               <b-row v-else cols="1" class="d-flex justify-content-between">
                 <b-col class="pr-0 text-right" >
                   <b-button v-if="success.userID && validation.password" type="button" variant="primary" @click="change">Cambia</b-button>
                 </b-col>
                 <b-col class="pr-0 text-right">
                   <b-button v-if="validation.userID && !success.userID && !changeDefaultPassword" type="button" variant="primary" @click="checkUser">Continua</b-button>
                 </b-col>
               </b-row>
             </b-container>

           </b-form>
         </b-card-body>
       </b-card>
       <not-found v-if="isNotFound" />
       <b-alert v-else variant="danger" :show="link.valid===false">
         <b-container>
           <b-row cols="1">
             <b-col class="py-2">
               <strong>{{link.msg}}</strong>
             </b-col>
             <b-col class="text-right">
               <router-link :to="{name: 'login'}" replace><b-button>Vai al Login</b-button></router-link>
             </b-col>
           </b-row>
         </b-container>
       </b-alert>
     </div>
   </template>
 </center-container>

</template>

<script>
import {mapGetters} from "vuex";
import NotFound from "../404";
export default {
  name: "ChangePassword",
  components: {NotFound},
  data: function (){
    return {
      link: {
        valid: null,
        msg: 'Link non valido.'
      },
      processing: true,

      changeDefaultPassword: false,

      userID: '',
      hash_password: '',
      checkPassword: '',

      validation:{
        userID: null,
        password: null
      },
      token: '',
      _id: '',
      success: {
        userID: false,
        password: false
      },

      error: {
        show: false,
        msg: '',
        tryAgain: false
      }
    }
  },
  computed: {
    ...mapGetters({
      isLoggedIn: 'session/isLoggedIn',
      accessToken: 'session/accessToken',

      temporaryToken: 'users/reset-password/tempAccessToken',
      temporaryUserIdentifier: 'users/reset-password/tempUserIdentifier',
      isInTempSession: 'users/reset-password/isInTempSession'
    }),

    isNotFound(){
      return this.$route.name === 'change-password' && (!this.isLoggedIn || (this.isLoggedIn && !this.$route.params.firstLogin))
    }
  },
  watch: {
    processing(val) {
      if(val) this.error = {show: false, msg: ''}
    },
    'link.valid'(val){
      this.processing = false
      if(val === false) this.$store.commit('users/reset-password/unset-info')
    }
  },
  created() {
    this.checkLink()
    if(!this.isLoggedIn) {
      this.$store.commit('users/reset-password/set-info')
      if(this.isInTempSession) this.success.userID = true
    }
  },

  methods: {
    checkLink: function (){
      console.debug("CHANGE PASSWORD ", this.$route)
      this.changeDefaultPassword = this.isLoggedIn
      if(this.changeDefaultPassword){
        if(this.$route.params.firstLogin){
          this.link.valid = true
          this.success.userID = true
          this._id = this.$route.params.id
        }else{
          this.link.valid = false
        }
      }
      else if(this.$route.query.key == null) {
        this.link.valid = false;
        console.error(this.link)
      }
      else {
        this.$store.dispatch('users/reset-password/check-link', this.$route.query.key)
            .then(() => this.link.valid = true)
            .catch(err => {
                this.link.msg = this.handleRequestErrors.users.checkLinkResetPassword(err)
                this.link.valid = false
            })
            .finally(() => this.processing = false)
      }
    },

    checkUserID: function (){
      this.validation.userID = this.userID.length > 0
    },

    checkUser: function (){
      if(this.validation.userID){
        this.processing = true

        this.$store.dispatch('users/reset-password/exist-with-username', {userID:this.userID, key: this.$route.query.key})
            .then(response => this.success.userID = true)
            .catch(err => {
              this.error.show = true
              this.error.msg = this.handleRequestErrors.users.getUserFromNickname(err)
            })
            .then(() => this.processing = false)
      }
    },

    tryAgain(){
      this.success.userID = false
      this.error = { show: false, msg: '' , tryAgain: false }
    },

    change: function (){
      this.processing = true

      this.$store.dispatch('users/reset-password/make', { userID:  this.temporaryUserIdentifier || this._id, newPassword: this.hash_password, accessToken: this.temporaryToken || this.accessToken })
              .then(res => {
                console.debug('response ', res)
                if(res?.status === 200){
                  this.$router.replace(this.changeDefaultPassword ? {name:'p-user-account', params: {id: this._id}} : {name: 'login'})
                } else {
                  let msg = this.handleRequestErrors.users.resetPassword(res)
                  if(msg) this.error = { show: true, msg , tryAgain: res.response?.status === 401 }
                  this.validation.password = false
                }
                this.processing = false
              })
    }

  }

}
</script>

<style scoped>

</style>
