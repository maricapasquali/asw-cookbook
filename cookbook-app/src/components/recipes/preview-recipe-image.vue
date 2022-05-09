<template>
  <b-img v-if="$data._image" :fluid="!noFluid" class="recipe-image w-100" :src="$data._image" @error="imageNotFound"/>
</template>

<script>
export default {
  name: "preview-recipe-image",
  props: {
    value: String,
    withoutDefault: Boolean,
    noFluid: Boolean
  },
  data(){
    return {
      defaultImageRecipes: require('@assets/images/recipe-image.jpg'),
      _image: ''
    }
  },
  watch: {
    value(val, old){
      this.setImage(val)
    }
  },
  methods: {
    imageNotFound(e){
      this.$data._image = this.withoutDefault ? '' : this.defaultImageRecipes
      this.$emit('onImageNotFound', e)
    },
    setImage(val){
      this.$data._image = this.withoutDefault ? val : (val || this.defaultImageRecipes)
    }
  },
  created() {
    this.setImage(this.value)
  }
}
</script>

<style scoped>
</style>
