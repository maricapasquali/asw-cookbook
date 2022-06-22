<template>
  <error-handler
    :value="value"
    title="Server Error"
    variant="danger"
    @input="$emit('input', $event)"
  >
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
import ErrorHandler from "./error-handler"

export default {
    name: "ServerErrorHandler",
    components: { ErrorHandler },
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
    computed: {
        isNetworkError() {
            return this.value.message === "Network Error"
        }
    }
}
</script>

<style scoped>
/* stylelint-disable no-empty-source */
</style>
