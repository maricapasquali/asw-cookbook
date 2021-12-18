<template>
  <div>
    <!-- Public User Information  -->
    <user-information ref="user-info" :id="user" />
    <!-- Shared Recipe of one specific user -->
    <container-collapsable v-if="recipes.length" id="recipes" title="Ricette" @collapsed="onCollapsedRecipes" :with-loading-others="areRecipesOthers" @load-others="othersRecipes">
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
                <country-image v-model="recipe.country" :id="'recipe-'+ind" />
              </b-col>
            </b-row>
          </b-list-group-item>
        </b-list-group>
      </template>
      <template #load-others>carica altre ...</template>
    </container-collapsable>

    <!-- Accepted friend of one specific user -->
    <container-collapsable v-if="friends.length" id="friends" title="Amici" @collapsed="onCollapsedFriends" :with-loading-others="areFriendsOthers" @load-others="othersFriends">
      <template #collapse-content>
        <b-list-group class="my-3">
          <b-list-group-item v-for="(friend, ind) in friends" :key="ind">
            <b-row>
              <b-col align="start">
                <b-row align-v="center" cols="1" cols-sm="2">
                  <b-col class="pr-3" sm="5"> <avatar v-model="friend.user.img" /> </b-col>
                  <b-col class="mt-2">
                    <router-link @click.native="fetchData(friend)" :to="{name: 'single-user', params: {id: friend.user._id}}">{{friend.user.userID}}</router-link>
                    <p class="mb-0">{{friend.user.occupation}}</p>
                  </b-col>
                </b-row>
              </b-col>
              <b-col align="end">
                <country-image v-model="friend.user.country" :id="'friend-'+ind" class="mb-2" width="50" height="40" />
                <b-friendship :other-user="friend.user"/>
              </b-col>
            </b-row>
          </b-list-group-item>
        </b-list-group>
      </template>
      <template #load-others>carica altre ...</template>
    </container-collapsable>
  </div>
</template>

<script>
import {dateFormat} from "@services/utils";
import {RecipeCategories} from "@services/app";

import api from '@api'
import {mapGetters} from "vuex";
import {mapping} from "@services/api/users/friends/utils";

export default {
  name: "OneUser",
  computed: {
    user(){
      return this.$route.params.id
    },
    areRecipesOthers(){
      return this.recipes.length >0 && this.recipes.length < this.recipesTotal
    },
    areFriendsOthers(){
      return this.friends.length >0 && this.friends.length < this.friendsTotal
    },

    ...mapGetters(['accessToken', 'userIdentifier', 'isLoggedIn', 'isSigned'])
  },
  filters: {
    dataFormatter: dateFormat
  },
  data(){
    return {
      /* User Recipes Section */
      showRecipeSection: false,

      recipesTotal: 0,
      recipes: [],
      recipePaginationOptions: {
        page: 1,
        limit: 1 //todo: change pagination limit from 1 to 10
      },

      friendsTotal: 0,
      friends: [],
      friendsPaginationOptions: {
        page: 1,
        limit: 1 //todo: change pagination limit from 1 to 10
      }
    }
  },
  methods: {

    fetchData(friend){
      console.log('Fetch User info .')
      this.$refs['user-info'].getUser(friend.user._id)
      this.getRecipes()
      this.getFriends()
    },

    /* User Recipes Section */
    remappingRecipe(recipe){

      let _category = RecipeCategories.find(recipe.category)
      if(_category) recipe.category = _category

      return recipe
    },

    getRecipes(currentPage){
      this.recipePaginationOptions.page = currentPage || 1
      console.debug('Recipe Pagination = ', JSON.stringify(this.recipePaginationOptions, null, 1))

      api.recipes
         .getRecipes(this.user, this.accessToken, 'shared', this.recipePaginationOptions)
         .then(({data}) =>{
           let _remapData = data.items.map(recipe => this.remappingRecipe(recipe))

           if(currentPage) this.recipes.push(..._remapData)
           else this.recipes = _remapData

           this.recipesTotal = data.total
           console.debug('Recipes : ',  this.recipes)
         })
          //TODO: HANDLER ERROR N RECIPE (shared) OF USER WITH 'id'
         .catch(err => console.error(err))
    },

    othersRecipes(){
      console.debug('Press \'other\' recipes button ...')
      this.getRecipes(this.recipePaginationOptions.page + 1)
    },

    onCollapsedRecipes({show}){
      console.debug('Recipe: collapsed show = ', show)
     // if(show && this.recipes.length === 0) this.getRecipes()
    },

    /* User Friends Section */
    remappingFriend: mapping,

    getFriends(currentPage) {
      this.friendsPaginationOptions.page = currentPage || 1
      console.debug('Friend Pagination = ', JSON.stringify(this.friendsPaginationOptions, null, 1))

      let state = this.userIdentifier === this.user ? 'accepted': undefined
      api.friends
         .getFriendOf(this.user, this.accessToken, { state: state }, this.friendsPaginationOptions)
         .then(({data}) => {
           let _remapData = data.items.map(recipe => this.remappingFriend(recipe, this.user))

           if(currentPage) this.friends.push(..._remapData)
           else this.friends = _remapData

           this.friendsTotal = data.total
           console.debug('Friends : ',  this.friends)

         })
          //TODO: HANDLER ERROR N FRIEND (accepted) OF USER WITH 'id'
         .catch(err => console.error(err))
    },

    othersFriends(){
      console.debug('Press \'other\' friends button ...')
      this.getFriends(this.friendsPaginationOptions.page + 1)
    },

    onCollapsedFriends({show}){
      console.debug('Friend: collapsed show = ', show)
      // if(show && this.recipes.length === 0) this.getRecipes()
    },
  },
  mounted() {
    this.getRecipes()
    this.getFriends()
  }
}
</script>

<style scoped>
</style>