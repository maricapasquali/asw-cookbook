<template>
  <b-card  v-if="show">
    <template #header v-if="closable">
      <b-col class="text-right">
        <b-icon-x-square-fill font-scale="1.5" class="icon" @click="closeEditor"/>
      </b-col>
    </template>

    <b-row cols="1" cols-sm="1">
      <b-col>
        <b-form-group label-for="mini-editor">
          <b-form-textarea rows="6" id="mini-editor" v-model="content"></b-form-textarea>
        </b-form-group>
      </b-col>
    </b-row>

    <template #footer v-if="isContentNotEmpty">
      <b-col  class="text-right">
        <b-button variant="primary" @click="endEdit">
          <slot name="edit">Edit</slot>
        </b-button>
      </b-col>
    </template>
  </b-card>
</template>

<script>
export default {
  name: "mini-text-editor",
  props: {
    value: {
      type: Boolean,
      default: true
    },
    noclosable:{
      type: Boolean,
      default: false
    },
    resetContent: Boolean
  },
  data(){
    return {
      show: true,
      content: ''
    }
  },
  watch:{
    value(val, old){
      this.show = val
    },
    resetContent(val){
      if(val) {
        this.content = ''
        this.closeEditor()
      }
    }
  },
  computed:{
    closable(){
      return !this.noclosable
    },
    isContentNotEmpty(){
      return this.content.length > 0
    }
  },
  methods: {
    closeEditor() {
      if(this.closable) {
        this.$emit('close')
        this.$emit('input', false)
      }
    },
    endEdit() {
      this.$emit('end-edit',this.content)
    }
  },
  mounted() {
    this.show = this.value
  }
}
</script>

<style scoped>
</style>