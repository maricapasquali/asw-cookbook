<template>
  <b-img v-if="$data._image" fluid class="recipe-image w-100" :src="$data._image" @error="imageNotFound"/>
</template>

<script>
export default {
  name: "preview-recipe-image",
  props: {
    value: String,
    withoutDefault: Boolean
  },
  data(){
    return {
      defaultImageRecipes: require('@assets/images/recipe-image.jpg'),
      _image: ''
    }
  },
  methods: {
    imageNotFound(e){
      this.$data._image = this.withoutDefault ? '' : this.defaultImageRecipes
      this.$emit('onImageNotFound', e)
    }
  },
  created() {
    this.$data._image = this.withoutDefault ? this.value : (this.value || this.defaultImageRecipes)
  }
}
</script>

<style scoped>
</style>