<template>
  <b-img
    v-if="image"
    :fluid="!noFluid"
    class="recipe-image w-100"
    :src="image"
    @error="imageNotFound"
  />
</template>

<script>
export default {
    name: "PreviewRecipeImage",
    props: {
        value: {
            type: String,
            required: true,
            default: ""
        },
        withoutDefault: Boolean,
        noFluid: Boolean
    },
    data() {
        return {
            defaultImageRecipes: require("@assets/images/recipe-image.jpg"),
            image: ""
        }
    },
    watch: {
        value(val) {
            this.setImage(val)
        }
    },
    created() {
        this.setImage(this.value)
    },
    methods: {
        imageNotFound(e) {
            this.image = this.withoutDefault ? "" : this.defaultImageRecipes
            this.$emit("onImageNotFound", e)
        },
        setImage(val) {
            this.image = this.withoutDefault ? val : (val || this.defaultImageRecipes)
        }
    }
}
</script>

<style scoped>
/* stylelint-disable no-empty-source */
</style>
