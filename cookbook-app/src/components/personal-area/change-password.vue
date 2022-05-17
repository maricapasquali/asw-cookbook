<template>
  <b-modal body-class="position-static"
           v-model="show" title="Cambia password" @hide="close" :hide-footer="validation!==true || processing || success" ok-only centered>
    <b-alert v-model="error.show" variant="danger">{{error.message}}</b-alert>
    <b-alert v-if="success" v-model="success" variant="success">La password è stata cambiata.</b-alert>
    <b-form v-else>
      <wrap-loading v-model="processing">
        <div class="p-2">
          <b-form-group label="Vecchia password *" label-for="old-p">
            <input-password-switch-visibility id="old-p" placeholder="Enter old password" v-model="oldPassword" :state="validationOld" @input="checkOldPassword" required />
            <b-form-valid-feedback :state="validationOld"> Corretta! </b-form-valid-feedback>
          </b-form-group>
          <form-inputs-password :old="oldPassword" @inputPassword="newPassword=$event" @checkPassword="checkNewPassword=$event"/>
        </div>
      </wrap-loading>
    </b-form>
    <template v-slot:modal-footer>
      <b-button variant="primary" @click="change">Cambia</b-button>
    </template>

  </b-modal>
</template>

<script>

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
      checkNewPassword: null,
    }
  },
  computed: {
    ...mapGetters({
      accessToken: 'session/accessToken'
    }),
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
      if(!vl) {
        this.$socket.off("check:old-password:result",this._onCheckOldPassword.bind(this))
        this.oldPassword = ""
        this.newPassword = ""
        this.validationOld = null
        this.checkNewPassword = null
      } else {
        this.$socket.on("check:old-password:result", this._onCheckOldPassword.bind(this))
      }
    },
    processing(val){
      if(val) this.error = { show: false, message: '' }
    }
  },
  methods: {
    _onCheckOldPassword(res){
      console.debug("Old password is correct: ", res)
      this.validationOld = res
    },
    checkOldPassword: function (){
      if(this.oldPassword?.trim()?.length) this.$socket.emit("check:old-password", this.oldPassword)
    },
    close: function (){
      console.debug("close change password modal  ...")
      this.$emit('close')
    },
    change: function (e){
      e.preventDefault()
      console.debug("Change password ...")
      this.processing = true
      this.$store.dispatch('users/update-password',{oldPassword: this.oldPassword, newPassword: this.newPassword})
               .then(({data}) => {
                 console.debug(data)
                 this.$emit('onChangePassword', data)
                 this.$socket.emit('user:update:password')
                 this.show = false
               })
               .catch(err => {
                 let message = this.$store.$api.errorsHandler.users.changePassword(err)
                 if(message) this.error = {show: true, message}
               })
               .then(() => this.processing = false)
    }
  }
}
</script>

<style scoped>

</style>