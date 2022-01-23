<template>
  <b-modal v-model="value"
           rounded
           :hide-header="!closable"
           hide-footer
           no-close-on-backdrop
           :hide-header-close="!closable"
           :centered="centered"
           @close="clickClose">
    <b-alert v-model="value" :variant="variant" class="text-center" centered>
      <h1>{{app_name}}</h1>
      <slot name="msg"></slot>
    </b-alert>
  </b-modal>
</template>

<script>
export default {
  name: "modal-alert",
  props:{
    value: Boolean,
    msg: String,
    closable: Boolean,
    centered:{
      type: Boolean,
      default: true
    },
    variant: {
      type: String,
      enum: ['danger', 'success', 'warning', 'info', 'dark']
    }
  },
  data: function (){
    return {
      app_name: require("@app/app.config.json").app_name,
    }
  },
  methods:{
    clickOk: function (){
      this.$emit('ok')
    },
    clickCancel: function (){
      this.$emit('cancel')
    },
    clickClose: function (e){
      if(this.closable) e.preventDefault()
      console.log('Close Modal Error...')
      this.$emit('close')
    }
  }
}
</script>

<style scoped>
/deep/ .modal-body{
  padding: 0!important;
}

.alert{
  margin-bottom: 0;
  padding: 1.25rem;
}
</style>