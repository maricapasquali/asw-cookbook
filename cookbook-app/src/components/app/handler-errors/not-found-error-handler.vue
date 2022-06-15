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
      dismissible
      class="my-0"
      @dismissed="close"
    >
      <p class="h4 pt-2 pb-3">
        <strong> Resource Not found </strong>
      </p>
      <p
        v-if="resource"
        class="h6 pt-2 pb-3"
      >
        {{ resource.name }} {{ resource.id? `( ${resource.id}) ` : '' }} non è stata/o trovata/o.
      </p>
    </b-alert>
  </b-modal>
</template>

<script>
export default {
    name: "NotFoundErrorHandler",
    props: {
        value: {
            type: Object, // { show: Boolean, resource: [Object, String] }
            required: true
        }
    },
    computed: {
        show() {
            return this.value.show
        },
        resource() {
            return this.value.resource
        }
    },
    methods: {
        close() {
            this.$emit("input", { show: false, resource: "" })
        }
    }
}
</script>

<style scoped>

</style>
