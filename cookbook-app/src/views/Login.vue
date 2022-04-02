<template>
  <center-container >
    <template v-slot:content>
      <!-- LOGIN -->
      <wrap-loading v-model="onLogin.processing" >
        <b-card>
          <div class="text-center"> <h1 class="text-primary"><em>{{ $appName }}</em></h1></div>
          <b-card-body>
            <b-alert :variant="onLogin.error.info? 'info': 'danger'" v-model="onLogin.error.show">{{onLogin.error.msg}}</b-alert>
            <b-form @submit.prevent="onLoginSubmit">
              <b-form-group
                  id="input-group-1"
                  label="UserID"
                  label-for="input-1"
              >
                <b-form-input
                    id="input-1"
                    v-model.trim="credential.userID"
                    :state="validationUserID"
                    @input="checkUserID"
                    type="text"
                    placeholder="Enter userID"
                    required
                ></b-form-input>
              </b-form-group>
              <b-form-group
                  id="input-group-password"
                  label="Password"
                  label-for="input-password"
              >
                <b-form-input
                    id="input-password"
                    v-model.trim="credential.password"
                    :state="validationPassword"
                    @input="checkPassword"
                    type="password"
                    placeholder="Enter password"
                    required
                ></b-form-input>
                <b-form-invalid-feedback :state="validationPassword">
                  La password deve avere almeno 5 caratteri
                </b-form-invalid-feedback>
              </b-form-group>

              <b-container>
                <b-row cols="1" cols-md="2" class="d-flex justify-content-between">
                  <b-col class="pl-0">
                    <b-button id="forgot-password" class="pl-0" variant="link" @click="showModalResetPassword">Password dimenticata?</b-button>
                  </b-col>
                  <b-col class="pr-0 text-right" v-if="validationUserID && validationPassword">
                    <b-button variant="primary" type="submit" class="mb-2">Accedi</b-button>
                  </b-col>
                </b-row>
                <div class="text-center">
                  <b-button id="signup" @click="showSignUp=true" class="pl-0" variant="link">Non hai ancora un'account?</b-button>
                </div>
              </b-container>

            </b-form>
          </b-card-body>
        </b-card>
      </wrap-loading>

      <!-- RESET PASSWORD -->
      <b-modal
          v-model="resetPassword.show"
          centered
          @hidden="resetModalResetPassword"
          title="Richiesta Reset Password"
          :hide-footer="(!resetPassword.showSend && !resetPassword.success ) || resetPassword.processing">

        <template #modal-header-close/>

        <wrap-loading v-model="resetPassword.processing">
          <b-alert variant="danger" v-model="resetPassword.error.show">{{resetPassword.error.msg}}</b-alert>
          <b-alert variant="success" v-model="resetPassword.success">E' stata inviata un email con un link per il reset della password.</b-alert>
          <b-container fluid class="py-2">
            <b-form-group
                id="input-group-3"
                label="E-mail"
                label-for="input-3">
              <b-form-input
                  id="input-3"
                  v-model.trim="resetPassword.email"
                  :state="validationEmail"
                  @input="checkEmail"
                  type="email"
                  placeholder="Enter email"
                  required
              ></b-form-input>
              <b-form-invalid-feedback :state="validationEmail">
                Email non è valida.
              </b-form-invalid-feedback>
            </b-form-group>
          </b-container>
        </wrap-loading>
        <template #modal-footer="{ok}">
          <div slot="modal-ok" v-show="resetPassword.showSend">
            <b-button type="submit" @click="sendLinkResetPassword" variant="primary"> Invia </b-button>
          </div>

          <div slot="modal-ok" v-show="resetPassword.success">
            <b-button type="submit" variant="primary" @click="closeModalResetPassword(ok)"> Ok </b-button>
          </div>
        </template>
      </b-modal>

      <!-- SIGNUP -->
      <b-modal centered title="Crea un account" v-model="showSignUp" hide-footer no-close-on-backdrop>
        <sign-up/>
      </b-modal>

    </template>
  </center-container>
</template>

<script>

import {mapActions} from "vuex";

export default {
  name: "Login",
  data: function (){
    return {
      credential: {
        userID: '',
        password: ''
      },

      validationUserID: null,
      validationPassword: null,
      validationEmail: null,
      onLogin: {
        processing: false,
        error: {show: false, msg:'', info: false}
      },
      resetPassword:{
        processing: false,
        show: false,
        showSend: false,
        email: '',
        success: false,
        error: {
          show: false,
          msg: ''
        },
      },
      showSignUp: false
    }
  },
  watch: {
    'resetPassword.processing'(val){
      if(val) this.resetPassword.error = { show: false, msg: ''}
    },
    'onLogin.processing'(val){
      if(val) this.onLogin.error = { show: false, msg: '', info: false }
    }
  },
  methods: {
    ...mapActions({
      login: 'session/login'
    }),

    // VALIDATION
    checkUserID: function (){
      this.validationUserID = this.credential.userID.length > 0
    },

    checkPassword: function (){
      this.validationPassword = this.credential.password.length > 4
    },

    checkEmail: function (){
      const valid = EmailValidator.check(this.resetPassword.email)
      this.resetPassword.showSend = valid
      this.validationEmail = valid
    },

    //MODAL
    showModalResetPassword: function (){
      this.resetPassword.show = true
    },

    closeModalResetPassword: function (ok){
      if(typeof ok === 'function') ok();
      this.resetPassword = {
        show: false,
        showSend: false,
        email: '',
        success: false,
        error: {
          show: false,
          msg: ''
        },
      }
    },

    resetModalResetPassword: function(){
      this.closeModalResetPassword()
      this.validationEmail = null
    },

    //REQUEST
    sendLinkResetPassword: function (event){
      event.preventDefault()
      this.resetPassword.processing = true
      this.$store.dispatch('users/reset-password/request', this.resetPassword.email)
         .then(() =>{
           this.resetPassword.success = true
           this.resetPassword.showSend = false
         })
         .catch(err =>{
           this.resetPassword.error.show = true
           this.resetPassword.error.msg = this.$store.$api.errorsHandler.users.emailResetPassword(err)
         })
         .finally(() => this.resetPassword.processing = false)
    },

    onLoginSubmit(){
      this.onLogin.processing = true
      this.login(this.credential)
          .then(({location, session}) => {
            console.log('LOCATION ', location)
            this.$router.replace(location)
            this.$broadcastChannel.postMessage({login: session})
            console.debug('Store state: ', this.$store.state)
          })
          .catch(err => {
            this.onLogin.error.show = true
            this.onLogin.error.info = err.response?.status === 409
            this.onLogin.error.msg = this.$store.$api.errorsHandler.session.login(err)
          })
          .then(() => this.onLogin.processing = false)
    }
  }
}
</script>

<style scoped>
#forgot-password:focus, #signup:focus{
  box-shadow: none!important;
}

/deep/ input{
  white-space: nowrap!important;
  overflow: hidden!important;
  text-overflow: ellipsis!important;
}
</style>
