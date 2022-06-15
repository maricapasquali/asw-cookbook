<template>
  <b-modal
    v-model="show"
    rounded
    :hide-header="!closable"
    hide-footer
    no-close-on-backdrop
    :hide-header-close="!closable"
    :centered="centered"
    @close="clickClose"
  >
    <b-alert
      v-model="show"
      :variant="variant"
      class="text-center"
      centered
    >
      <h1>{{ $appName }}</h1>
      <slot name="msg">
        {{ msg }}
      </slot>
    </b-alert>
  </b-modal>
</template>

<script>
export default {
    name: "ModalAlert",
    props: {
        value: Boolean,
        msg: {
            type: String,
            default: ""
        },
        closable: Boolean,
        centered:{
            type: Boolean,
            default: true
        },
        variant: {
            type: String,
            default: "info",
            enum: ["danger", "success", "warning", "info", "dark"]
        }
    },
    data() {
        return {
            show: false
        }
    },
    watch: {
        show(val) {
            this.$emit("input", val)
        },
        value(val) {
            this.show = val
        }
    },
    created() {
        this.show = this.value
    },
    methods: {
        clickOk() {
            this.$emit("ok")
        },
        clickCancel() {
            this.$emit("cancel")
        },
        clickClose(e) {
            if (this.closable) e.preventDefault()
            console.debug("Close Modal Error...")
            this.$emit("close")
        }
    }
}
</script>

<style scoped>
/deep/ .modal-body {
  padding: 0 !important;
}

.alert {
  margin-bottom: 0;
  padding: 1.25rem;
}
</style>
