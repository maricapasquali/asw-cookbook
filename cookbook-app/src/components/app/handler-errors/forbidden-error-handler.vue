<template>
  <error-handler
    :value="_error"
    title="Forbidden"
    variant="danger"
    no-closable
    @input="$emit('input', $event)"
  >
    <template #more-details>
      <div class="d-flex justify-content-end">
        <b-button
          variant="primary"
          @click="goHomePage"
        >
          Torna alla HomePage
        </b-button>
      </div>
    </template>
  </error-handler>
</template>

<script>
import ErrorHandler from "./error-handler"

export default {
    name: "ForbiddenErrorHandler",
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
        _error() {
            return  { status: 403, show: this.value.show, message: this._message }
        },
        _message() {
            switch (this.value.method) {
                case "get": return "Non sei autorizzata/o ad accedere a questa/e risorsa/e."
                case "post": return "Non sei autorizzata/o a creare questa/e risorsa/e."
                case "delete": return "Non sei autorizzata/o a cancellare questa/e risorsa/e."
            }
            if (["put", "patch"].includes(this.method)) return "Non sei autorizzata/o ad aggiornare questa/e risorsa/e."
            return this.value?.message || "Non sei autorizzata/o ad accedere a questa/e area."
        },
        method() {
            return this.value.method
        }
    },
    methods: {
        goHomePage() {
            this.$router.replace({ name: "homepage" })
            this.$emit("input", { show: false })
        }
    }
}
</script>

<style scoped>
/* stylelint-disable no-empty-source */
</style>
