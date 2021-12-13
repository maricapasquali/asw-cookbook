<template>
  <div>
    <!-- Public User Information  -->
    <user-information :id="user" />
    <!-- Shared Recipe of one specific user -->
    <container-collapsable v-if="recipes.length"  title="Ricette" @collapsed="onCollapsedRecipes" :with-loading-others="areOthers" @load-others="othersRecipes">
      <template #collapse-content>
        <b-list-group class="my-3">
          <b-list-group-item v-for="(recipe, ind) in recipes" :key="ind">
            <b-row>
              <b-col align="start">
                <b-row cols="1">
                  <b-col>
                    <router-link :to="{name: 'single-recipe', params: {id: user, recipe_id: recipe._id}}">
                      {{ recipe.name }}
                    </router-link>
                  </b-col>
                  <b-col>  <small>{{recipe.createdAt | dataFormatter}}</small> </b-col>
                </b-row>
              </b-col>
              <b-col align="end">
                <span> {{ recipe.category.text }} </span>
                <country-image v-model="recipe.country" :id="'country-recipe-'+recipe._id"></country-image>
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
import {dateFormat} from "@services/utils";
import {RecipeCategories} from "@services/app";

import api from '@api'
import {mapGetters} from "vuex";

export default {
  name: "OneUser",
  computed: {
    user(){
      return this.$route.params.id
    },
    areOthers(){
      return this.recipes.length >0 && this.recipes.length < this.total
    },
    ...mapGetters(['accessToken'])
  },
  filters: {
    dataFormatter: dateFormat
  },
  data(){
    return {
      /* User Recipes Section */
      showRecipeSection: false,
      total: 0,
      recipes: [],
      paginationOptions: {
        page: 1,
        limit: 1 //todo: change pagination limit from 1 to 10
      }
    }
  },
  methods: {
    /* User Recipes Section */
    remappingRecipe(recipe){

      let _category = RecipeCategories.find(recipe.category)
      if(_category) recipe.category = _category

      return recipe
    },

    getRecipes(currentPage){
      this.paginationOptions.page = currentPage || 1
      console.debug('Pagination = ', JSON.stringify(this.paginationOptions, null, 1))

      api.recipes
         .getRecipes(this.user, this.accessToken, 'shared', this.paginationOptions)
         .then(({data}) =>{
           let _remapData = data.items.map(recipe => this.remappingRecipe(recipe))

           if(currentPage) this.recipes.push(..._remapData)
           else this.recipes = _remapData

           this.total = data.total
           console.debug('Recipes : ',  this.recipes)
         })
          //TODO: HANDLER ERROR N RECIPE (shared) OF USER WITH 'id'
         .catch(err => console.error(err))
    },

    othersRecipes(){
      console.debug('Press \'other\' button ...')
      this.getRecipes(this.paginationOptions.page + 1)
    },

    onCollapsedRecipes({show}){
      console.debug('Recipe: collapsed show = ', show)
     // if(show && this.recipes.length === 0) this.getRecipes()
    }
  },
  mounted() {
    this.getRecipes()
  }
}
</script>

<style scoped>
</style>