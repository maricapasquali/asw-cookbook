<template>
  <div ref="avatar-container" >
    <b-img v-if="$data._image" ref="avatar-image" :width="width" :height="height" rounded="circle" :src="$data._image" alt="immagine profilo" @error="imageError" />
    <b-icon-person-circle v-else :width="100" :height="100" class="mx-auto"/>
  </div>
</template>

<script>

import {Server} from "@services/api";

export default {
  name: "avatar",
  props: {
    value: String,
    width: {
      type: String,
      default: "100"
    },
    height: {
      type: String,
      default: "100"
    }
  },
  data: function(){
    return {
      _image: ''
    }
  },
  methods: {
    imageError(e){
      this.$data._image = ''
      this.$emit('onNotFound', { container: this.$refs["avatar-container"], imageElement: this.$refs["avatar-image"] })
    }
  },
  mounted() {
    if(this.value) this.$data._image = Server.images.path(this.value)
  }
}
</script>

<style scoped>
</style>