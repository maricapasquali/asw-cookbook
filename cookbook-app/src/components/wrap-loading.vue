<template>
  <b-overlay
    :show="value"
    :spinner-variant="spinnerVariant"
    :spinner-type="spinnerType"
  >
    <slot />
  </b-overlay>
</template>

<script>
export default {
    name: "WrapLoading",
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