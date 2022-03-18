<template>
  <b-card  v-if="show" class="mb-2" no-body>
    <b-container v-if="show" class="mb-2">
      <b-row cols="1" cols-sm="1">
        <b-col class="text-right my-2" v-if="closable">
          <font-awesome-icon icon="times" class="icon mr-1" aria-label="Chiudi editor" @click="closeEditor"/>
        </b-col>
        <b-col>
          <b-form-group label-for="mini-editor">
            <b-form-textarea rows="6" id="mini-editor" v-model="$data._content"></b-form-textarea>
          </b-form-group>
        </b-col>
        <b-col class="text-right" v-if="isContentNotEmpty">
          <b-button variant="primary" @click="endEdit">
            <slot name="edit">Edit</slot>
          </b-button>
        </b-col>
      </b-row>
    </b-container>
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
    noClosable: Boolean,
    resetContent: Boolean,
    content: {
      type: String,
      default: ''
    }
  },
  data(){
    return {
      show: true,
      _content: ''
    }
  },
  watch:{
    value(val, old){
      this.show = val
    },
    resetContent(val){
      if(val) {
        this.$data._content = ''
        this.closeEditor()
      }
    }
  },
  computed:{
    closable(){
      return !this.noClosable
    },
    isContentNotEmpty(){
      return this.$data._content.length > 0 && this.$data._content !== this.content
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
      this.$emit('end-edit',this.$data._content)
    }
  },
  mounted() {
    this.show = this.value
    this.$data._content = this.content
  }
}
</script>

<style scoped>
</style>