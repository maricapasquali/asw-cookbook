<template>
  <b-modal
    v-model="show"
    centered
    body-class="p-0"
    hide-footer
    hide-header
    hide-header-close
    no-close-on-backdrop
    no-close-on-esc
  >
    <b-alert
      show
      :variant="variant"
      :dismissible="!noClosable"
      class="my-0"
      @dismissed="show = false"
    >
      <div v-if="value.status">
        <p class="h4 pt-2 pb-3">
          <strong> {{ title }} </strong>
        </p>
        <p class="h6 pt-2 pb-3">
          {{ value.status }} - {{ value.message }}
        </p>
      </div>
      <div v-else>
        <p class="h4 pt-2">
          <strong> {{ value.message || title }} </strong>
        </p>
      </div>
      <slot name="more-details" />
    </b-alert>
  </b-modal>
</template>

<script>
import HandlerErrorsMixin from "./handler-errors.mixin"

export default {
    name: "ErrorHandler",
    mixins: [HandlerErrorsMixin],
    props: {
        title: { type: String, required: true },
        value: { type: Object, required: true },
        variant: { type: String, default: "light" },
        noClosable: Boolean
    }
}
</script>

<style scoped>

</style>
