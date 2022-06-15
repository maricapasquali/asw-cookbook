<template>
  <div>
    <b-button
      pill
      variant="primary"
      @click="clickTrigger"
    >
      <font-awesome-icon icon="minus" />
    </b-button>
    <span class="ml-3">
      <slot name="filter-name">{{ filterName }}</slot>
    </span>
  </div>
</template>

<script>
export default {
    name: "FilterApply",
    props: {
        filterName: {
            type: String,
            default: ""
        }
    },
    methods: {
        clickTrigger(e) {
            this.$emit("remove", e)
        }
    }
}
</script>

<style scoped>

</style>