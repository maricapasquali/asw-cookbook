<template>
  <b-modal v-model="value.show" title="Sessione scaduta" centered
           @ok="continueHere" @cancel="goLogin" @hide="close" hide-header-close no-close-on-esc no-close-on-backdrop>
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
  data(){
    return {
      _forceRenderRoute: false
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
      this.$data._forceRenderRoute = this.$route.name === 'homepage' || !this.value._forbiddenPage
      if(this.$data._forceRenderRoute) {
        console.debug('Force update router ...')
        this.$emit('force-render-router')
      }
      this.$router.replace({ name: this.value._forbiddenPage ? 'homepage' : this.$route.name })
    },
    _resetForceRenderRoute(){
      console.debug('Reset force update router')
      this.$emit('close')
    },
    close(){
      if(this.$data._forceRenderRoute) {
        this.$data._forceRenderRoute = false
        setTimeout(this._resetForceRenderRoute.bind(this), 1)
      }
    }
  }
}
</script>

<style scoped>

</style>
