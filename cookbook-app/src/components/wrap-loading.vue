<template>
  <b-overlay :show="value" :spinner-variant="spinnerVariant" :spinner-type="spinnerType">
    <slot></slot>
  </b-overlay>
</template>

<script>
export default {
  name: "wrap-loading",
  props: {
    value: Boolean,
    spinnerType: {
      type: String,
      default: "grow"
    },
    spinnerVariant:{
      type: String,
      default: "primary"
    }
  }
}
</script>

<style scoped>

</style>