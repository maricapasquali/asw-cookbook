<template>
  <div>
    <b-alert
      variant="success"
      class="text-center"
      :show="addRecipe"
      dismissible
      @dismissed="addRecipe=false"
    >
      Inserimento ricetta avvenuto correttamente.
    </b-alert>
    <recipe-form
      @onShared="onShareRecipe"
      @onSaved="onSaveRecipe"
    />
  </div>
</template>

<script>
export default {
    name: "AddRecipeTab",
    data() {
        return {
            addRecipe: false
        }
    },
    methods: {
        onShareRecipe(recipe) {
            this.addRecipe = true
            this.$emit("onShareRecipe", recipe)
        },
        onSaveRecipe(recipe) {
            this.addRecipe = true
            this.$emit("onSaveRecipe", recipe)
        }
    }
}
</script>

<style scoped>
/* stylelint-disable no-empty-source */
</style>
