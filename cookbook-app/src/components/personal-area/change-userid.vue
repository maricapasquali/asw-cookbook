<template>
  <b-modal body-class="position-static"
           v-model="show" title="Cambia userID"
           :hide-footer="validation!==true || processing"
           @hide="close"
           no-close-on-esc
           no-close-on-backdrop
           ok-only centered>
    <b-alert v-model="error.show" variant="danger">{{error.message}}</b-alert>
    <wrap-loading v-model="processing">
      <b-form-group label="UserID" label-for="c-userID" class="py-2">
        <b-form-input id="c-userID" type="text" v-model.trim="userID" @input="check" :state="validation"/>
      </b-form-group>
    </wrap-loading>
    <template v-slot:modal-footer>
      <b-button variant="primary" @click="changeUserID">Cambia</b-button>
    </template>
  </b-modal>
</template>

<script>
import api from '@api'
import {mapGetters} from "vuex";

export default {
  name: "change-userid",
  props:{
    value: Boolean,
    id: String,
    old_userID: String
  },
  data: function (){
    return {
      show: false,
      processing: false,
      error:{
        show: false,
        message: ''
      },

      userID: '',
      validation: null,
    }
  },
  mounted() {
    this.userID = this.old_userID
  },
  computed: {
    ...mapGetters(['accessToken', 'socket'])
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
    check: function (){
      this.validation = this.userID.length===0 ? false : (this.old_userID === this.userID ? null : true)
    },
    close: function (){
      console.debug("close change userID modal  ...")
      this.$emit("close")
    },
    changeUserID: function (e){
      e.preventDefault()
      this.processing = true

      api.users
         .changeUserID(this.id, {old_userID: this.old_userID, new_userID: this.userID}, this.accessToken)
         .then(response => {
            console.log("CHANGE USER ID...")
            this.$emit("onChangeUserID", this.userID)
            this.$socket.emit('user:update:info', { _id: this.id, userID: this.userID })
            this.show = false
         })
         .catch(err => {
           let message = this.handleRequestErrors.users.changeUserID(err)
           if(message) this.error = {show: true, message}
         })
         .finally(() => this.processing = false)
    }
  }
}
</script>

<style scoped>

</style>