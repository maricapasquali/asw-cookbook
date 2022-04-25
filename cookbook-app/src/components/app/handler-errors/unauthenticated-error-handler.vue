<template>
  <b-modal v-model="value.show" title="Sessione scaduta" centered
           @ok="continueHere" @cancel="goLogin" hide-header-close no-close-on-esc no-close-on-backdrop>
    <template #modal-ok>Continua</template>
    <template #modal-cancel>Login</template>
    <template #default>
      <p>La sessione di accesso è scaduta.</p>
      <p>Puoi rieffettuato l'accesso o continuare come utente ospite.</p>
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
    _reset(){
      this.$store.dispatch('reset')
      this.$emit('input', {show: false, message:''})
    },
    goLogin(){
      this._reset()
      this.$router.push({name: 'login'})
    },
    continueHere(){
      this._reset()
      this.$router.replace({ name: this.value._forbiddenPage ? 'homepage' : this.$route.name })
    }
  }
}
</script>

<style scoped>

</style>
