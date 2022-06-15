<template>
  <b-container fluid>
    <loading v-model="loading" />
    <modal-alert
      v-model="error.show"
      variant="danger"
    >
      <template #msg>
        <p>{{ error.msg }}</p>
      </template>
    </modal-alert>
    <modal-alert
      v-model="success.show"
      variant="success"
    >
      <template #msg>
        <p>{{ success.msg }}</p>
        <p>
          <router-link
            to="login"
            replace
          >
            <b-button variant="primary">
              Vai a Login
            </b-button>
          </router-link>
        </p>
      </template>
    </modal-alert>
  </b-container>
</template>

<script>

export default {
    name: "CheckAccount",
    data() {
        return {
            loading: true,
            error:{
                show: false,
                msg: "",
            },
            success:{
                show: false,
                msg: "ACCOUNT VERIFICATO.",
            },
        }
    },
    created() {
        this.$store.dispatch("users/check-account", this.$route.query)
            .then(({ data }) => {
                this.success.show = true
                this.$socket.emit("user:signup", data._id)
            })
            .catch(err => {
                this.error.show = true
                this.error.msg = this.$store.$api.errorsHandler.users.checkAccount(err)
            })
            .finally(() => this.loading = false)
    }
}
</script>

<style scoped>
</style>
