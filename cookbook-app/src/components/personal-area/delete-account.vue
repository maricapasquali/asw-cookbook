<template>
  <b-modal body-class="position-static"
           v-model="show"
           title="Cancellazione account"
           @cancel="cancelDeleteAccount"
           @ok="eraseAccount"
           :hide-footer="processing"
           no-close-on-backdrop
           no-close-on-esc
           centered>
    <b-alert v-model="error.show" variant="danger">{{error.message}}</b-alert>
    <wrap-loading v-model="processing">
      <slot name="message"><span class="py-2"> Sei sicura/o di voler cancellare definitivamente l'account? </span></slot>
    </wrap-loading>
    <template v-slot:modal-ok> Si </template>
    <template v-slot:modal-cancel> No </template>
  </b-modal>
</template>

<script>
import {mapGetters} from "vuex";

export default {
  name: "delete-account",
  props:{
    id: String,
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
    ...mapGetters({
      accessToken: 'session/accessToken'
    })
  },
  watch: {
    value(vl){
      this.show = vl
    },
    show(vl){
      this.$emit('input', vl)
    },
    processing(val){
      if(val) this.error = { show: false, message: '' }
    }
  },
  methods:{

    cancelDeleteAccount: function (e){
      this.processing = false
      this.error = {
        show: false,
        message: ''
      }
      console.debug("close delete account modal  ...")
      this.$emit("close")
    },

    eraseAccount: function (e){
      e.preventDefault()

      this.processing = true
      this.$store.dispatch('users/erase', this.id)
         .then(({data}) => {
            console.debug(data)
            this.$socket.emit('user:delete', this.id)
            this.$emit("onDeleteAccount", data)
            this.show = false
         })
         .catch(err => {
            let message = this.$store.$api.errorsHandler.users.deleteAccount(err)
            if(message) this.error = {show: true, message}
         })
         .finally(() => this.processing = false)
    }
  }
}
</script>

<style scoped>

</style>