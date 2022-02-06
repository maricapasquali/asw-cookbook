<template>
  <b-modal v-model="value.show" title="Sessione scaduta" centered
           @ok="continueHere" @cancel="goLogin" hide-header-close no-close-on-esc no-close-on-backdrop>
    <template #modal-ok>Continua</template>
    <template #modal-cancel>Login</template>
    <template #default>
      <p>La sessione di accesso è scaduta.</p>
      <p>Puoi rieffettuato l'accesso o continuare senza effettuare l'accesso.</p>
    </template>
  </b-modal>
</template>

<script>
export default {
  name: "unauthenticated-error-handler",
  props: {
    value: {
      show: Boolean,
      message: String
    }
  },
  methods: {
    goLogin(){
      this.$router.push({name: 'login'})
    },
    continueHere(){
      if(this.value._forbiddenPage) this.$router.replace({name: 'homepage'})
      else {
        this.$emit('input', {show: false, message:''})
        // TODO: find way to no use 'this.$router.go' when request status is 401
        // this.$router.go(0)
      }
    }
  }
}
</script>

<style scoped>

</style>