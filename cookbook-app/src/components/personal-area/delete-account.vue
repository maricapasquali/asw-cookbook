<template>
  <div>
    <loading v-model="processing" :zIndex="10000"></loading>
    <b-modal body-class="position-static"
             v-model="show"
             title="Cancellazione account"
             @cancel="cancelDeleteAccount"
             @ok="eraseAccount"
             centered>
      <b-alert v-model="error.show" variant="danger">{{error.message}}</b-alert>
      <slot name="message"> Sei sicura/o di voler cancellare definitivamente l'account? </slot>
      <template v-slot:modal-ok> Si </template>
      <template v-slot:modal-cancel> No </template>
    </b-modal>
  </div>
</template>

<script>
import api from '@api'
import {isString} from "@services/utils";

import {mapGetters} from "vuex";

export default {
  name: "delete-account",
  props:{
    id: String,
    adminVersion: Boolean,
    value: Boolean
  },
  data: function (){
    return {
      show: false,
      processing: false,
      error:{
        show: false,
        message: ''
      }
    }
  },
  computed: {
    ...mapGetters(['accessToken'])
  },
  watch: {
    value(vl){
      this.show = vl
    },
    show(vl){
      this.$emit('input', vl)
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
      this.processing = true
      api.users
         .deleteAccount(this.id, this.accessToken)
         .then(response => {
            console.debug(response)
            if(this.adminVersion) this.$emit("onDeleteAccount", response)
            else {
              this.$store.commit('endSession')
              this.$router.replace({ name: "homepage"})
            }
         })
         .catch(err => {
            this.error.message = api.users.HandlerErrors.deleteAccount(err)
            if(isString(this.error.message)){
              this.error.show = true
            }else if(err.response.status === 401){
              this.$emit('onSessionExpired')
            }
         })
         .finally(() => this.processing = false)
    }
  }
}
</script>

<style scoped>

</style>