<template>
  <b-overlay :z-index="zIndex" :show="value" spinner-variant="secondary" opacity="0.3" no-wrap></b-overlay>
</template>

<script>
export default {
  name: "loading",
  props:{
    value: Boolean,
    zIndex: {
      type: Number,
      default: 10
    }
  }
}
</script>

<style scoped>

</style>