<template>
  <b-container fluid>
    <modal-alert variant="danger" v-model="error.show">
      <template v-slot:msg>
        <p>{{error.msg}}</p>
      </template>
    </modal-alert>
    <modal-alert variant="success" v-model="success.show">
      <template v-slot:msg>
        <p>{{success.msg}}</p>
        <p><router-link to="login" replace><b-button variant="primary">Vai a Login</b-button></router-link></p>
      </template>
    </modal-alert>
  </b-container>
</template>

<script>
import api from '@api'
import {mapGetters} from "vuex";
export default {
  name: "CheckAccound",
  data: function (){
    return {
      error:{
        show: false,
        msg: '',
      },
      success:{
        show: false,
        msg: 'ACCOUNT VERIFICATO.',
      },
    }
  },
  computed: {
    ...mapGetters(['socket'])
  },
  created() {
    api.users
       .checkAccount(this.$route.query)
       .then(({data}) => {
          this.success.show = true
          this.socket.emit('user:signup', data._id)
       }, err => {
          this.error.show = true
          this.error.msg = api.users.HandlerErrors.checkAccount(err)
       })
  }
}
</script>

<style scoped>
</style>