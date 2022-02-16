<template>
  <div v-if="$data._video" class="preview-tutorial w-100">
    <video class="w-100 h-100" :src="$data._video" :poster="_poster" @error="onError" controls>
      Your browser does not support the video tag.
    </video>
  </div>
  <preview-recipe-image v-else-if="_showOnlyPoster" v-model="poster"/>
</template>

<script>
import PreviewRecipeImage from "./preview-recipe-image"
export default {
  name: "preview-recipe-tutorial",
  props: {
    value: String,
    poster: String,
    withoutDefaultPoster: Boolean,
    withImage: Boolean
  },
  data(){
    return {
      defaultImageRecipe: PreviewRecipeImage.data().defaultImageRecipes
    }
  },
  computed: {
    _poster(){
      return this.poster || (!this.withoutDefaultPoster && this.defaultImageRecipe)
    },
    _showOnlyPoster(){
      return this.withImage && !this.$data._video
    }
  },
  methods: {
    onError(e){
      console.error('Video is not found. ', e)
      this.$data._video = ''
      this.$emit('onVideoNotFound')
    }
  },
  created() {
    this.$data._video = this.value
    console.debug('Set tutorial preview video = ', this.$data._video)
  }
}
</script>

<style lang="scss" scoped>
.preview-tutorial > video {
  object-fit: cover;
  cursor: pointer;
}
</style>
