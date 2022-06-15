<template>
  <b-container>
    <b-row v-if="areOthers && !inProcessing">
      <b-col class="text-center">
        <b-button
          :class="linkBtnClass"
          variant="link"
          @click="onClick"
        >
          <slot name="btn-content">
            Carica altre ...
          </slot>
        </b-button>
      </b-col>
    </b-row>
    <b-row
      v-show="inProcessing"
      class="mt-3"
      align-h="center"
    >
      <b-col class="text-center">
        <b-spinner
          :variant="spinnerVariant"
          label="carica altre risorse"
        />
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
export default {
    name: "LoadOthers",
    props: {
        areOthers: {
            type: Boolean,
            require: true
        },
        inProcessing: {
            type: Boolean,
            require: true
        },
        linkVariant: {
            type: String,
            default: "primary"
        },
        spinnerVariant: {
            type:String,
            default: "primary"
        },
    },
    computed: {
        linkBtnClass() {
            return "text-"+this.linkVariant
        }
    },
    methods: {
        onClick(event) {
            this.$emit("load", event)
        }
    }
}
</script>

<style scoped>
/* stylelint-disable no-empty-source */
</style>
