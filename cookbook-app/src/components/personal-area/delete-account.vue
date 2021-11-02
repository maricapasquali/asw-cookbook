<template>
  <div>
    <loading v-model="processing" :zIndex="10000"></loading>
    <b-modal body-class="position-static"
             v-model="show"
             title="Cancellazione account"
             @hide="cancelDeleteAccount"
             @ok="eraseAccount"
             centered>
      <b-alert v-model="error.show" variant="danger">{{error.message}}</b-alert>
      Sei sicura/o di voler cancellare definitivamente l'account?
      <template v-slot:modal-ok> Si </template>
      <template v-slot:modal-cancel> No </template>
    </b-modal>
  </div>
</template>

<script>
import api from '@api'
import {Session} from "@services/session";
import {isString} from "@services/utils";

export default {
  name: "delete-account",
  props:{
    id: String
  },
  data: function (){
    return {
      show: true,
      processing: false,
      error:{
        show: false,
        message: ''
      }
    }
  },
  mounted() {
    console.log("v-model = ", this.value)
  },
  methods:{
    cancelDeleteAccount: function (e){
      this.processing = false
      this.error = {
        show: false,
        message: ''
      }
      console.log("cancel  ...")
      this.$emit("close")
    },

    eraseAccount: function (e){
      e.preventDefault()
      this.processing = true
      api.users.deleteAccount(this.id, Session.accessToken())
          .then(response => {
            Session.end()

            this.$router.replace({ name: "homepage"})
          })
          .catch(err => {
            this.error.message = api.users.HandlerErrors.deleteAccount(err)
            if(isString(this.error.message)){
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