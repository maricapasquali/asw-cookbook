<template>
  <b-container>
    <b-row v-if="areOthers && !inProcessing">
      <b-col class="text-center">
        <b-button :class="linkBtnClass" variant="link" @click="triggerOthers">
          <slot name="btn-content">Carica altre ... </slot>
        </b-button>
      </b-col>
    </b-row>
    <b-row class="mt-3" align-h="center" v-show="inProcessing">
      <b-col class="text-center">
        <b-spinner :variant="spinnerVariant" label="carica altre risorse"></b-spinner>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
export default {
  name: "load-others",
  props: {
    areOthers: {
      type: Boolean,
      require: true
    },
    triggerOthers:{
      type: Function,
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
    linkBtnClass(){
      return "text-"+this.linkVariant
    }
  }
}
</script>

<style scoped>

</style>