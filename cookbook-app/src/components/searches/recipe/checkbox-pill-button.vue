<template>
  <b-container fluid class="px-0">
    <b-button class="mb-2 mr-1" pill
              v-for="opt in options" :key="opt.value" @click="onSelect(opt)" :variant="variantOnChecked(opt)">
      {{opt.text}}
    </b-button>
  </b-container>
</template>

<script>
export default {
  name: "checkbox-pill-button",
  props: {
    value: Array,
    options: Array
  },
  methods: {
    variantOnChecked(opt){
      let index = this.value.findIndex(d => d === opt.value)
      return index === -1 ? 'outline-primary': 'primary'
    },

    onSelect(opt){
      let index = this.value.findIndex(d => d === opt.value)
      if(index === -1) this.value.push(opt.value)
      else this.value.splice(index, 1)
    },
  }

}
</script>

<style scoped>

</style>