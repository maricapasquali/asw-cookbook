<template>
  <div>
    <loading v-model="processing" :zIndex="10000"></loading>
    <b-modal body-class="position-static"
             v-model="show" title="Cambia userID" @hide="close"
             :hide-footer="validation!==true"
             ok-only centered>
      <b-alert v-model="error.show" variant="danger">{{error.message}}</b-alert>
      <b-form-group label="UserID" label-for="c-userID">
        <b-form-input id="c-userID" type="text" v-model.trim="userID" @input="check" :state="validation"/>
      </b-form-group>
      <template v-slot:modal-footer>
        <b-button variant="primary" @click="changeUserID">Cambia</b-button>
      </template>
    </b-modal>
  </div>
</template>

<script>
import api from '@api'
import {isString} from "@services/utils";
import {mapGetters} from "vuex";

export default {
  name: "change-userid",
  props:{
    id: String,
    old_userID: String
  },
  data: function (){
    return {
      show: true,
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
  methods: {
    check: function (){
      this.validation = this.userID.length===0 ? false : (this.old_userID === this.userID ? null : true)
    },
    close: function (){
      this.$emit("close")
    },
    changeUserID: function (e){
      e.preventDefault()
      this.error = { show: false, message: '' }
      this.processing = true

      api.users
         .changeUserID(this.id, {old_userID: this.old_userID, new_userID: this.userID}, this.accessToken)
         .then(response => {
            console.log("CHANGE USER ID...")
            this.$emit("changeUserID", this.userID)

            this.socket.emit('user:update:info', { _id: this.id, userID: this.userID })

         })
         .catch(err => {
            console.error(err)
            this.error.message = api.users.HandlerErrors.changeUserID(err)
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