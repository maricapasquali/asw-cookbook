<template>
  <error-handler v-model="_badRequestError" title="Bad Request" variant="warning"/>
</template>

<script>
import ErrorHandler from "./error-handler";
export default {
  name: "bad-request-error-handler",
  components: {ErrorHandler},
  computed: {
    _badRequestError(){
      return this.$store.state.requestError.badRequestError
    }
  }
}
</script>

<style scoped>

</style>