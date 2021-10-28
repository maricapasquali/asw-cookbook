<template>
  <div>
    <loading v-model="processing" :zIndex="10000"></loading>
    <b-modal body-class="position-static"
             v-model="show" title="Cambia password" @hide="close" :hide-footer="validation!==true || success" ok-only centered>
      <b-alert v-model="error.show" variant="danger">{{error.message}}</b-alert>
      <b-alert v-if="success" v-model="success" variant="success">La password è stata cambiata.</b-alert>
      <b-form v-else>
        <b-form-group label="Vecchia password *" label-for="old-p">
          <b-form-input id="old-p" type="password" placeholder="Enter old password" v-model.trim="oldPassword" :state="validationOld" @input="checkOldPassword" required/>
        </b-form-group>
        <input-password :old="oldPassword" @inputPassword="newPassword=$event" @checkPassword="checkNewPassword=$event"/>
      </b-form>
      <template v-slot:modal-footer>
        <b-button variant="primary" @click="change">Cambia</b-button>
      </template>

    </b-modal>
  </div>
</template>

<script>

import api from '@api'
import {PasswordValidator} from "@app/modules/validator";
import {Session} from "@services/session";
import Utils from "@services/utils";

export default {
  name: "change-password",
  props:{
    id: String
  },
  data: function (){
    return {
      show: true,
      processing: false,
      success: false,
      error:{
        show: false,
        message: ''
      },
      validationOld: null,
      oldPassword: '',
      newPassword: '',
      checkNewPassword: '',
    }
  },
  computed: {
    validation: function (){
      return this.validationOld && this.newPassword.length > 0 && this.checkNewPassword
    }
  },
  methods: {
    checkOldPassword: function (){
      this.validationOld = PasswordValidator.check(this.oldPassword)
    },
    close: function (){
      this.$emit('close')
    },
    change: function (){
      this.error = { show: false, message: '' }
      console.log("Change password ...")
      this.processing = true
      api.users.changeOldPassword(this.id,{old_password: this.oldPassword, new_hash_password: this.newPassword}, Session.accessToken())
               .then(response => {
                 this.success = true
                 console.log(response.data)
               })
               .catch(err => {
                 console.error(err)

                 this.error.message = api.users.HandlerErrors.changePassword(err)
                 if(Utils.isString(this.error.message)){
                   this.error.show = true
                 }else if(err.response.status === 401){
                   this.$emit('onSessionExpired')
                 }
               })
               .then(() => this.processing = false)
    }

  }
}
</script>

<style scoped>

</style>