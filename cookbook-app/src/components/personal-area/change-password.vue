<template>
  <div>
    <b-modal body-class="position-static"
             v-model="show" title="Cambia password" @hide="close" :hide-footer="validation!==true || processing || success" ok-only centered>
      <b-alert v-model="error.show" variant="danger">{{error.message}}</b-alert>
      <b-alert v-if="success" v-model="success" variant="success">La password è stata cambiata.</b-alert>
      <b-form v-else>
       <wrap-loading v-model="processing">
          <div class="p-2">
            <b-form-group label="Vecchia password *" label-for="old-p">
              <b-form-input id="old-p" type="password" placeholder="Enter old password" v-model.trim="oldPassword" :state="validationOld" @input="checkOldPassword" required/>
            </b-form-group>
            <input-password :old="oldPassword" @inputPassword="newPassword=$event" @checkPassword="checkNewPassword=$event"/>
          </div>
       </wrap-loading>
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
import {mapGetters} from "vuex";

export default {
  name: "change-password",
  props:{
    value: Boolean,
    id: String
  },
  data: function (){
    return {
      show: false,
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
    ...mapGetters(['accessToken', 'socket']),
    validation: function (){
      return this.validationOld && this.newPassword.length > 0 && this.checkNewPassword
    }
  },
  watch: {
    value(val){
      this.show = val
    },
    show(vl){
      this.$emit('input', vl)
    },
    processing(val){
      if(val) this.error = { show: false, message: '' }
    }
  },
  methods: {
    checkOldPassword: function (){
      this.validationOld = PasswordValidator.check(this.oldPassword)
      /*TODO: EXPLOIT SOCKET FOR CHECK IF OLD PASSWORD IS CORRECT */
    },
    close: function (){
      console.debug("close change password modal  ...")
      this.$emit('close')
    },
    change: function (e){
      e.preventDefault()
      console.log("Change password ...")
      this.processing = true
      api.users.changeOldPassword(this.id,{old_password: this.oldPassword, new_hash_password: this.newPassword}, this.accessToken)
               .then(({data}) => {
                 console.log(data)
                 this.$emit('onChangePassword', data)
                 this.socket.emit('user:update:password')
                 this.show = false
               })
               .catch(err => {
                 let message = api.users.HandlerErrors.changePassword(err)
                 if(message) this.error = {show: true, message}
               })
               .then(() => this.processing = false)
    }

  }
}
</script>

<style scoped>

</style>