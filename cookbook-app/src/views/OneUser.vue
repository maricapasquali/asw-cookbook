<template>
  <div>
    <!-- Public User Information  -->
    <user-information :id="identifierUser"></user-information>
    <!-- Shared Recipe of one specific user -->
    <container-collapsable title="Ricette" @collapsed="onCollapsedRecipes" :with-loading-others="others" @load-others="othersRecipes">
      <template #collapse-content>
        <b-list-group class="my-3">
          <b-list-group-item v-for="(recipe, ind) in recipes" :key="ind">
            <b-row>
              <b-col align="start">
                <router-link to="#"> {{ recipe.name }} </router-link> <!-- TODO: add link to page of one specific recipe  -->
              </b-col>
              <b-col align="end">
                <span> {{ recipe.category.text }} </span>
                <country-image v-model="recipe.nationality" :id="'country-recipe-'+recipe._id"></country-image>
              </b-col>
            </b-row>
          </b-list-group-item>
        </b-list-group>
      </template>
      <template #load-others>carica altre ...</template>
    </container-collapsable>

    <!-- TODO: TEMPLATE AMICI -->
  </div>
</template>

<script>

import {RecipeCategories} from "@services/app";

export default {
  name: "OneUser",
  computed: {
    identifierUser(){
      return this.$route.params.id
    }
  },
  data(){
    return {
      /* User Recipes Section */
      showRecipeSection: false,
      defaultRecipeImage: require('@assets/images/recipe-image.jpg'),
      totalsRecipes: 9,
      others: true,
      recipes: []
    }
  },
  methods: {
    /* User Recipes Section */
    remappingRecipe(recipe){
      // let _country = this.rCountries.find(c => c.value === recipe.nationality)
      // if(_country) recipe.nationality = _country

      let _category = RecipeCategories.find(recipe.category)
      if(_category) recipe.category = _category

      return recipe
    },

    getRecipes(){
      //TODO: REQUEST N RECIPE (shared) OF USER WITH 'id'
      this.recipes = require('@assets/examples/home-page.js')
          .filter(r => r.owner._id === this.identifierUser)
          .map(r => this.remappingRecipe(r.recipe))

      console.debug('Recipes : ', JSON.stringify( this.recipes))
    },

    othersRecipes(){
      //TODO: REQUEST others N RECIPE (shared) OF USER WITH 'id'
      require('@assets/examples/home-page.js')
          .filter(r => r.owner._id === this.identifierUser)
          .map(r => this.remappingRecipe(r.recipe))
          .forEach(r => this.recipes.push(r))

      console.debug('Recipes : ', JSON.stringify( this.recipes))

      if(this.totalsRecipes === this.recipes.length) this.others = false
    },

    onCollapsedRecipes({show}){
      console.log('Recipe: collapsed show = ', show)
      if(show && this.recipes.length === 0) this.getRecipes()
    }
  },
}
</script>

<style scoped>
</style>