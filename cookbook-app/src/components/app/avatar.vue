<template>
  <b-avatar :variant="variant" :src="$data._image" :size="size" @img-error="imageError" />
</template>

<script>

import {Server} from "@services/api";

export default {
  name: "avatar",
  props: {
    value: String,
    size: {
      type: Number,
      default: 70
    },
    variant: {
      type: String,
      default: 'dark'
    }
  },
  data: function(){
    return {
      _image: ''
    }
  },
  watch: {
    value(vl){
     this.setImage(vl)
    }
  },
  methods: {
    imageError(e){
      console.error('Image ' + this.$data._image + ' is not found.')
      this.$data._image = ''
      this.$emit('onNotFound')
    },
    setImage(vl){
        this.$data._image = vl ? Server.images.path(vl) : ''
    }
  },
  mounted() {
    this.setImage(this.value)
  }
}
</script>

<style scoped>
</style>