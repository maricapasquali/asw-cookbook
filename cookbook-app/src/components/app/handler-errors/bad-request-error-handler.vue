<template>
  <error-handler
    :value="value"
    title="Bad Request"
    variant="warning"
    @input="$emit('input', $event)"
  />
</template>

<script>
import ErrorHandler from "./error-handler"

export default {
    name: "BadRequestErrorHandler",
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
    }
}
</script>

<style scoped>

</style>
