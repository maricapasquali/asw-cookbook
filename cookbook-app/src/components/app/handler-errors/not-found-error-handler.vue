<template>
  <b-modal v-model="show" centered body-class="p-0" hide-footer hide-header hide-header-close no-close-on-backdrop no-close-on-esc >
    <b-alert show dismissible @dismissed="show = false" class="my-0">
      <p class="h4 pt-2 pb-3"> <strong> Resource Not found </strong> </p>
      <p class="h6 pt-2 pb-3">{{resource.name}} {{resource.id? `( ${resource.id}) ` : ''}} non è stata/o trovata/o.</p>
    </b-alert>
  </b-modal>
</template>

<script>
export default {
  name: "not-found-error-handler",
  computed: {
    show: {
      get(){
        return this.$store.state.requestError.notFoundResource.show
      },
      set(val){
        this.$store.commit('showNotFoundError', {show: val, resource: {}})
      }
    },
    resource(){
      return this.$store.state.requestError.notFoundResource.resource
    }
  },
}
</script>

<style scoped>

</style>