<template>
  <div>
    <!-- Public User Information  -->
    <not-found v-if="userNotFound" asset="user" />
    <user-information v-else ref="user-info" :id="user" @not-found="userNotFound = true"/>
    <!-- Shared Recipe of one specific user -->
    <container-collapsable v-if="recipes.length" id="recipes" title="Ricette" @collapsed="onCollapsedRecipes" :with-loading-others="areRecipesOthers" @load-others="othersRecipes">
      <template #collapse-content>
        <b-list-group class="my-3">
          <b-list-group-item v-for="(recipe, ind) in recipes" :key="ind">
            <b-row>
              <b-col class="text-left">
                <b-row cols="1">
                  <b-col>
                    <router-link :to="{name: 'single-recipe', params: {id: user, recipe_id: recipe._id}}">
                      {{ recipe.name }}
                    </router-link>
                  </b-col>
                  <b-col>  <small>{{recipe.createdAt | dataFormatter}}</small> </b-col>
                </b-row>
              </b-col>
              <b-col class="text-right">
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
              <b-col class="text-left">
                <b-row align-v="center" cols="1" cols-sm="2">
                  <b-col class="pr-3" sm="5"> <avatar v-model="friend.user.img" :user="friend.user._id"/> </b-col>
                  <b-col class="mt-2">
                    <router-link @click.native="fetchData(friend)" :to="{name: 'single-user', params: {id: friend.user._id}}">{{friend.user.userID}}</router-link>
                    <p class="mb-0">{{friend.user.occupation}}</p>
                  </b-col>
                </b-row>
              </b-col>
              <b-col class="text-right">
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

import {mapGetters} from "vuex";
import NotFound from "./404";

export default {
  name: "OneUser",
  components: {NotFound},
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

    ...mapGetters(['getRecipeCategoryByValue']),
    ...mapGetters({
      userIdentifier: 'session/userIdentifier'
    })
  },
  filters: {
    dataFormatter: function (text){
      return dateFormat(text)
    }
  },
  data(){
    return {
      userNotFound: false,

      /* User Recipes Section */
      recipesTotal: 0,
      recipes: [],
      recipePaginationOptions: {
        page: 1,
        limit: 1 //todo: change pagination limit from 1 to 10
      },

      /* User Friends Section */
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

      let _category = this.getRecipeCategoryByValue(recipe.category)
      if(_category) recipe.category = _category

      return recipe
    },

    getRecipes(currentPage, _limit){
      const page = currentPage || 1
      const limit = _limit || this.recipePaginationOptions.limit

      console.debug('Recipe Pagination = ', {page, limit})
      this.$store.dispatch('recipes/all-shared-for-user', { ownerID: this.user, pagination: {page, limit} })
         .then(({data}) =>{
           let _remapData = data.items.map(recipe => this.remappingRecipe(recipe))

           if(currentPage) this.recipes.push(..._remapData)
           else this.recipes = _remapData

           this.recipesTotal = data.total
           if(!_limit) this.recipePaginationOptions.page = page
           console.debug('Recipes : ',  this.recipes)
         })
         .catch(err => this.handleRequestErrors.recipes.getRecipe(err))
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
    getFriends(currentPage, _limit) {
      const page = currentPage || 1
      const limit = _limit || this.friendsPaginationOptions.limit
      console.debug('Friend Pagination = ', {page, limit})

      let state = this.userIdentifier === this.user ? 'accepted': undefined
      this.$store.dispatch('friendships/of', { userID: this.user, state, pagination: {page, limit} })
         .then(({data}) => {
           if(currentPage) this.friends.push(...data.items)
           else this.friends = data.items

           this.friendsTotal = data.total
           if(!_limit) this.friendsPaginationOptions.page = page
           console.debug('Friends : ',  this.friends)
         })
         .catch(this.handleRequestErrors.friends.getFriendOf)
    },

    othersFriends(){
      console.debug('Press \'other\' friends button ...')
      this.getFriends(this.friendsPaginationOptions.page + 1)
    },

    onCollapsedFriends({show}){
      console.debug('Friend: collapsed show = ', show)
      // if(show && this.recipes.length === 0) this.getRecipes()
    },

    /*Listener notification*/
    onUpdatedRecipeListeners(_, recipe){
      if(recipe) {
        let index = this.recipes.findIndex(r => r._id === recipe._id)
        if(index !== -1){
          this.remappingRecipe(recipe)
          this.recipes.splice(index, 1, recipe)
        }
      }
    },

    fetchRecipe(_, recipe){
      if(recipe) this.getRecipes(0, this.recipePaginationOptions.page * this.recipePaginationOptions.limit)
    },
    fetchFriend(friendship){
      console.debug('Friend ship ', friendship)
      if(friendship && (this.user === friendship.from._id || this.user === friendship.to._id)) {
        this.getFriends(0, this.friendsPaginationOptions.page * this.friendsPaginationOptions.limit)
      }
    },

    /* Listeners update */
    onDeleteUser(id){
      if(id === this.user) {
        this.userNotFound = true
        this.recipes = []
        this.recipesTotal = 0
        this.friends = []
        this.friendsTotal = 0
      }
    }
  },
  created() {
    this.$bus.$on('recipe:create', this.fetchRecipe.bind(this))
    this.$bus.$on('recipe:update', this.onUpdatedRecipeListeners.bind(this))
    this.$bus.$on('recipe:delete', this.fetchRecipe.bind(this))

    this.$bus.$on('friend:add', this.fetchFriend.bind(this))
    this.$bus.$on('friend:remove', this.fetchFriend.bind(this))

    this.$bus.$on('user:delete', this.onDeleteUser.bind(this))

    this.getRecipes()
    this.getFriends()
  },
  beforeDestroy() {
    this.$bus.$off('recipe:create', this.fetchRecipe.bind(this))
    this.$bus.$off('recipe:update', this.onUpdatedRecipeListeners.bind(this))
    this.$bus.$off('recipe:delete', this.fetchRecipe.bind(this))

    this.$bus.$off('friend:add', this.fetchFriend.bind(this))
    this.$bus.$off('friend:remove', this.fetchFriend.bind(this))

    this.$bus.$off('user:delete', this.onDeleteUser.bind(this))
  }
}
</script>

<style scoped>
</style>