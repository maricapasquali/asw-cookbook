<template>
  <b-overlay
    :z-index="zIndex"
    :show="value"
    :spinner-variant="spinnerVariant"
    :spinner-type="spinnerType"
    opacity="0.3"
    :fixed="fixed"
    no-wrap
  />
</template>

<script>
export default {
    name: "Loading",
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
        },
        fixed: Boolean
    }
}
</script>

<style scoped>
/* stylelint-disable no-empty-source */
</style>
