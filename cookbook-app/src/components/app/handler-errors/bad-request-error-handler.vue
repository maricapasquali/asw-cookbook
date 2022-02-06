<template>
  <error-handler v-model="value" title="Bad Request" variant="warning"/>
</template>

<script>
import ErrorHandler from "./error-handler";
export default {
  name: "bad-request-error-handler",
  components: {ErrorHandler},
  props: {
    value: {
      show: Boolean,
      message: String
    }
  }
}
</script>

<style scoped>

</style>