<template>
  <div>
    <b-button pill @click="clickTrigger" variant="primary">
      <font-awesome-icon icon="minus" />
    </b-button>
    <span class="ml-3">
      <slot name="filter-name">{{ filterName }}</slot>
    </span>
  </div>
</template>

<script>
export default {
  name: "filter-apply",
  props: {
    filterName: {
      type: String,
      default: ''
    }
  },
  methods: {
    clickTrigger(e){
      this.$emit('remove', e)
    }
  }
}
</script>

<style scoped>

</style>