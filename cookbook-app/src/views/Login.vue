<template>
  <center-container >
    <template v-slot:content>
      <!-- LOGIN -->
      <wrap-loading v-model="processing" >
        <template>
          <b-card>
            <div class="text-center"> <h1 class="text-primary"><em>{{ app_name }}</em></h1></div>
            <b-card-body>
              <b-alert variant="danger" v-model="error.show">{{error.msg}}</b-alert>
              <b-form @submit="onSubmit">
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
        </template>
      </wrap-loading>

      <!-- RESET PASSWORD -->
      <b-modal
          v-model="resetPassword.show"
          centered
          @hidden="resetModalResetPassword"
          title="Richiesta Reset Password">
        <template #modal-header-close/>

        <b-alert variant="danger" v-model="resetPassword.error.show">{{resetPassword.error.msg}}</b-alert>
        <b-alert variant="success" v-model="resetPassword.success">E' stata inviata un email con un link per il reset della password.</b-alert>
        <b-container fluid>
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

import api from '@api'
import configuration from '@app/app.config.json'
import {EmailValidator} from "@app/modules/validator";
import {Session} from "@services/session";
import {bus} from "@/main";


export default {
  name: "Login",
  data: function (){
    return {
      app_name: configuration.app_name,
      credential: {
        userID: '',
        password: ''
      },

      validationUserID: null,
      validationPassword: null,
      validationEmail: null,

      processing: false,
      error: {
        show: false,
        msg: ''
      },
      resetPassword:{
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

  methods: {
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
    sendLinkResetPassword: async function (event){
      event.preventDefault()
      api.users.sendEmailResetPassword(this.resetPassword.email)
      .then(() =>{
        this.resetPassword.success = true
        this.resetPassword.showSend = false
      }).catch(err =>{
        this.resetPassword.error.show = true
        this.resetPassword.error.msg = api.users.HandlerErrors.emailResetPassword(err)
      })
    },

    login: function (){
      api.users.login(this.credential)
         .then(({data}) => {
           this.error.show = false
           let {token, userInfo} = data

           Session.start(token, userInfo)
           bus.$emit('session-start', {token: token.access, userID: userInfo.userID})

           let location = {
             name: data.firstLogin ? 'change-password' : 'p-user-account',
             params: { id: userInfo._id, firstLogin: data.firstLogin ? true : undefined},
           }
           console.log("LOGIN ", location)
           this.$router.replace(location)
         })
         .catch(err=>{
            this.error.show = true
            this.error.msg = api.users.HandlerErrors.login(err)
         })
         .then(() => this.processing = false)
    },

    onSubmit: function (event){
      event.preventDefault()
      this.processing = true
      this.login();
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