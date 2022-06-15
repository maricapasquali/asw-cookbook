<template>
  <b-modal
    v-model="show"
    title="Sessione scaduta"
    centered
    hide-header-close
    no-close-on-esc
    no-close-on-backdrop
    @ok="continueHere"
    @cancel="goLogin"
  >
    <template #modal-ok>
      Continua
    </template>
    <template #modal-cancel>
      Login
    </template>
    <template #default>
      <p>La sessione di accesso è scaduta.</p>
      <p>Puoi rieffettuato l'accesso o continuare come utente ospite.</p>
    </template>
  </b-modal>
</template>

<script>
import HandlerErrorsMixin from "./handler-errors.mixin"

export default {
    name: "UnauthenticatedErrorHandler",
    mixins: [HandlerErrorsMixin],
    props: {
        value: {
            type: Object,
            required: true,
            default() {
                return ({
                    show: false,
                    message: ""
                })
            }
        }
    },
    methods: {
        _reset() {
            this.$store.dispatch("reset")
            this.$emit("input", { show: false, message:"" })
        },
        goLogin() {
            this._reset()
            this.$router.push({ name: "login" })
        },
        continueHere() {
            this._reset()
            this.$router.replace({ name: this.value._forbiddenPage ? "homepage" : this.$route.name })
        }
    }
}
</script>

<style scoped>

</style>
