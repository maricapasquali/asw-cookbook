<template>
 <div>
   <b-modal v-model="show" title="Sessione scaduta" @ok="getNewTokens" @cancel="goHomePage" centered>
     <p>Vuoi continuare?</p>
   </b-modal>
   <modal-alert v-model="error.show" variant="danger" closable @close="error.show=false">
     <template v-slot:msg>
       {{error.message}}
     </template>
   </modal-alert>
 </div>
</template>

<script>
import api from "@api"
import {isString} from '@services/utils'
import {Session} from "@services/session";

export default {
  name: "timeout-session",
  props:{
    id: String,
    show: Boolean,
  },
  data: function (){
    return {
      error: {
        show: false,
        message: ''
      }
    }
  },
  methods: {
    goHomePage: function (){
      this.$router.replace({name: 'homepage'})
    },
    getNewTokens: function (e){
      e.preventDefault()
      console.log('GET NEW ACCESS TOKEN')
      // api.users.getNewAccessToken(this.id, { refresh_token: Session.refreshToken() }, Session.accessToken())
      //     .then(response =>{
      //       Session.setAccessToken(response.data.access_token)
      //       this.$router.go()
      //     }).catch(error =>{
      //       console.error(error)
      //       this.error.message = api.users.HandlerErrors.getNewAccessToken(error)
      //       if(isString( this.error.message)) {
      //         this.error.show = true
      //       }
      //       else if(error.response.status === 401 || error.response.status === 403){
      //           this.$router.replace({name: 'login'})
      //       }
      //       else if(error.response.status === 409){
      //
      //         this.$router.go()
      //       }
      //
      //     })
    },
  }
}
</script>

<style scoped>

</style>