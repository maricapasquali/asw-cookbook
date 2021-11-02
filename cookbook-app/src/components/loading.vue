<template>
  <b-overlay :z-index="zIndex" :show="value" :spinner-variant="spinnerVariant" :spinner-type="spinnerType" opacity="0.3" no-wrap></b-overlay>
</template>

<script>
export default {
  name: "loading",
  props:{
    value: Boolean,
    zIndex: {
      type: Number,
      default: 10
    },
    spinnerType: {
      type: String,
      default: "border"
    },
    spinnerVariant:{
      type: String,
      default: "secondary"
    }
  }
}
</script>

<style scoped>

</style>