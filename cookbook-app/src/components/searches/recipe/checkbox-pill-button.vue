<template>
  <b-container
    fluid
    class="px-0"
  >
    <b-button
      v-for="opt in options"
      :key="opt.value"
      class="mb-2 mr-1"
      pill
      :variant="variantOnChecked(opt)"
      @click="onSelect(opt)"
    >
      {{ opt.text }}
    </b-button>
  </b-container>
</template>

<script>
export default {
    name: "CheckboxPillButton",
    props: {
        value: {
            type: Array,
            required: true
        },
        options: {
            type: Array,
            required: true
        },
    },
    methods: {
        variantOnChecked(opt) {
            let index = this.value.findIndex(d => d === opt.value)
            return index === -1 ? "outline-primary": "primary"
        },

        onSelect(opt) {
            let index = this.value.findIndex(d => d === opt.value)
            if (index === -1) {
                this.$emit("input", [...this.value, opt.value])
            } else {
                let copyValue = [...this.value]
                copyValue.splice(index, 1)
                this.$emit("input", copyValue)
            }
        },
    }

}
</script>

<style scoped>

</style>
