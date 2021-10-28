<template>
  <b-overlay :show="value" spinner-variant="primary" spinner-type="grow">
    <slot></slot>
  </b-overlay>
</template>

<script>
export default {
  name: "wrap-loading",
  props: {
    value: Boolean
  }
}
</script>

<style scoped>

</style>