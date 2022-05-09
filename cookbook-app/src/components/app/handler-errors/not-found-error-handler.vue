<template>
  <b-modal v-model="show" centered body-class="p-0" hide-footer hide-header hide-header-close no-close-on-backdrop no-close-on-esc >
    <b-alert show dismissible @dismissed="close" class="my-0">
      <p class="h4 pt-2 pb-3"> <strong> Resource Not found </strong> </p>
      <p class="h6 pt-2 pb-3" v-if="resource">{{resource.name}} {{resource.id? `( ${resource.id}) ` : ''}} non è stata/o trovata/o.</p>
    </b-alert>
  </b-modal>
</template>

<script>
export default {
  name: "not-found-error-handler",
  props: {
    value: {
      show: Boolean,
      resource: Object | String
    }
  },
  computed: {
    show(){
      return this.value.show
    },
    resource(){
      return this.value.resource
    }
  },
  methods: {
    close(){
      this.$emit('input', {show: false, resource:''})
    }
  }
}
</script>

<style scoped>

</style>