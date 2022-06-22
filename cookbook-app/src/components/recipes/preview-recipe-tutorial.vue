<template>
  <div
    v-if="video_"
    class="preview-tutorial w-100"
  >
    <video
      class="w-100 h-100"
      :src="video_"
      :poster="_poster"
      controls
      @error="onError"
    >
      Your browser does not support the video tag.
    </video>
  </div>
  <preview-recipe-image
    v-else-if="_showOnlyPoster"
    v-model="_poster"
  />
</template>

<script>
import PreviewRecipeImage from "./preview-recipe-image"

export default {
    name: "PreviewRecipeTutorial",
    props: {
        value: {
            type: String,
            default: ""
        },
        poster: {
            type: String,
            default: ""
        },
        withoutDefaultPoster: Boolean,
        withImage: Boolean
    },
    data() {
        return {
            defaultImageRecipe: PreviewRecipeImage.data().defaultImageRecipes,

            video_: ""
        }
    },
    computed: {
        _poster() {
            return this.poster || (!this.withoutDefaultPoster && this.defaultImageRecipe)
        },
        _showOnlyPoster() {
            return this.withImage && !this.video_
        }
    },
    created() {
        this.video_ = this.value
        console.debug("Set tutorial preview video = ", this.video_)
    },
    methods: {
        onError(e) {
            console.error("Video is not found. ", e)
            this.video_ = ""
            this.$emit("onVideoNotFound")
        }
    }
}
</script>

<style scoped>
.preview-tutorial > video {
  object-fit: cover;
  cursor: pointer;
}
</style>
