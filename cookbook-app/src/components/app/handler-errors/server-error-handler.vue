<template>
  <error-handler v-model="serverError" title="Server Error" variant="danger">
    <template #more-details>
      <div v-if="isNetworkError">
        <p>Possible reason: </p>
        <ul>
          <li>Server may be down</li>
          <li>Your connection is too slow to satisfy the request</li>
        </ul>
      </div>
    </template>
  </error-handler>
</template>

<script>
import ErrorHandler from "./error-handler";
export default {
  name: "server-error-handler",
  components: {ErrorHandler},
  computed: {
    isNetworkError(){
      return this.serverError.message === 'Network Error'
    },
    serverError(){
      return this.$store.state.requestError.serverError
    },
  }
}
</script>

<style scoped>

</style>