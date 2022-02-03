<template>
  <b-modal v-model="value.show"
           centered body-class="p-0"
           hide-footer hide-header hide-header-close
           no-close-on-backdrop no-close-on-esc >
    <b-alert show :variant="variant" dismissible @dismissed="value.show=false" class="my-0">
      <div v-if="value.status">
        <p class="h4 pt-2 pb-3"> <strong> {{ title }} </strong> </p>
        <p class="h6 pt-2 pb-3"> {{value.status}} - {{value.message}} </p>
      </div>
      <div v-else>
        <p class="h4 pt-2"> <strong> {{ value.message || title }} </strong> </p>
      </div>
      <slot name="more-details"></slot>
    </b-alert>
  </b-modal>
</template>

<script>
export default {
  name: "error-handler",
  props: {
    title: {type: String, required: true},
    value: {type: Object, required: true},
    variant: { type: String, default: 'light'}
  }
}
</script>

<style scoped>

</style>