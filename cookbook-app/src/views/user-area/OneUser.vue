<template>
  <div>
    <not-found v-if="userNotFound" asset="user" />
    <b-container v-else >
      <b-row cols="1" class="p-2">
        <b-col>
          <!-- Public User Information  -->
          <user-information ref="user-info" :id="user" @not-found="userNotFound = true" @is-user-admin="$data._userIsSigned=!$event"/>
        </b-col>
      </b-row>
      <b-row cols="1" :cols-lg="allPresent ? 2: 1" class="p-2">
        <b-col>
          <!-- Shared Recipe of one specific user -->
          <container-collapsable v-if="recipes.length" id="recipes" title="Ricette" @collapsed="onCollapsedRecipes" :with-loading-others="areRecipesOthers" :others-in-progress="recipesProcessing" @load-others="othersRecipes">
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
          </container-collapsable>
        </b-col>
        <b-col>
          <!-- Accepted friend of one specific user -->
          <container-collapsable v-if="friends.length" id="friends" title="Amici" @collapsed="onCollapsedFriends" :with-loading-others="areFriendsOthers" :others-in-progress="friendsProcessing" @load-others="othersFriends">
            <template #collapse-content>
              <b-list-group class="my-3">
                <b-list-group-item v-for="(friend, ind) in friends" :key="ind">
                  <b-row>
                    <b-col class="text-left">
                      <b-row align-v="center" cols="1" cols-sm="2">
                        <b-col class="pr-3" sm="5"> <avatar v-model="friend.user.img" :user="friend.user._id"/> </b-col>
                        <b-col class="mt-2">
                          <router-link @click.native="fetchData" :to="{name: 'single-user', params: {id: friend.user._id}}">{{friend.user.userID}}</router-link>
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
          </container-collapsable>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>

import {mapGetters} from "vuex";
import NotFound from "../404";
import {QueuePendingRequests} from "@api/request";
import UserMixin from '@components/mixins/user.mixin'

export default {
  name: "OneUser",
  props: {
    user: String
  },
  mixins: [UserMixin],
  components: {NotFound},
  computed: {
    areRecipesOthers(){
      return this.recipes.length >0 && this.recipes.length < this.recipesTotal
    },
    areFriendsOthers(){
      return this.friends.length >0 && this.friends.length < this.friendsTotal
    },

    ...mapGetters(['getRecipeCategoryByValue']),
    ...mapGetters({
      userIdentifier: 'session/userIdentifier'
    }),

    allPresent(){
      return this.recipes.length && this.friends.length
    }
  },
  filters: {
    dataFormatter: function (text){
      return dateFormat(text)
    }
  },
  data(){
    return {
      userNotFound: false,
      _userIsSigned: null,

      pendingRequests: null,

      /* User Recipes Section */
      recipesTotal: 0,
      recipes: [],
      recipePaginationOptions: {
        page: 1,
        limit: 1 //todo: change pagination limit from 1 to 10
      },
      recipesProcessing: false,

      /* User Friends Section */
      friendsTotal: 0,
      friends: [],
      friendsPaginationOptions: {
        page: 1,
        limit: 1 //todo: change pagination limit from 1 to 10
      },
      friendsProcessing: false,
    }
  },
  watch: {
    '$data._userIsSigned'(val){
      if(val){
        this.getRecipes()
        this.getFriends()
        this.setListenersForUserSigned()
      } else {
        this.unsetListenersForUserSigned()
      }
    }
  },
  methods: {

    fetchData(){
      console.log('Fetch User info .')
      this.$emit('force-update')
    },

    /* User Recipes Section */
    remappingRecipe(recipe){

      let _category = this.getRecipeCategoryByValue(recipe.category)
      if(_category) recipe.category = _category

      return recipe
    },

    getRecipes(currentPage, _limit){
      let idReq = 'recipes-of'
      let options = QueuePendingRequests.makeOptions(this.pendingRequests, idReq)

      const page = currentPage || 1
      const limit = _limit || this.recipePaginationOptions.limit

      console.debug('Recipe Pagination = ', {page, limit})
      this.$store.dispatch('recipes/all-shared-for-user', { ownerID: this.user, pagination: {page, limit}, options })
         .then(({data}) =>{
           let _remapData = data.items.map(recipe => this.remappingRecipe(recipe))

           if(currentPage) this.recipes.push(..._remapData)
           else this.recipes = _remapData

           this.recipesTotal = data.total
           if(!_limit) this.recipePaginationOptions.page = page
           console.debug('Recipes : ',  this.recipes)
         })
         .catch(err => this.handleRequestErrors.recipes.getRecipe(err))
         .then(() => {
           this.pendingRequests.remove(idReq)
           this.recipesProcessing = false
         })
    },

    othersRecipes(){
      console.debug('Press \'other\' recipes button ...')
      this.recipesProcessing = true
      this.getRecipes(this.recipePaginationOptions.page + 1)
    },

    onCollapsedRecipes({show}){
      console.debug('Recipe: collapsed show = ', show)
     // if(show && this.recipes.length === 0) this.getRecipes()
    },

    /* User Friends Section */
    getFriends(currentPage, _limit) {
      let idReq = 'friend-of'
      let options = QueuePendingRequests.makeOptions(this.pendingRequests, idReq)

      const page = currentPage || 1
      const limit = _limit || this.friendsPaginationOptions.limit
      console.debug('Friend Pagination = ', {page, limit})

      let state = this.userIdentifier === this.user ? 'accepted': undefined
      this.$store.dispatch('friendships/of', { userID: this.user, state, pagination: {page, limit}, options})
         .then(({data}) => {
           if(currentPage) this.friends.push(...data.items)
           else this.friends = data.items

           this.friendsTotal = data.total
           if(!_limit) this.friendsPaginationOptions.page = page
           console.debug('Friends : ',  this.friends)
         })
         .catch(this.handleRequestErrors.friends.getFriendOf)
         .then(() => {
           this.pendingRequests.remove(idReq)
           this.friendsProcessing = false
         })
    },

    othersFriends(){
      console.debug('Press \'other\' friends button ...')
      this.friendsProcessing = true
      this.getFriends(this.friendsPaginationOptions.page + 1)
    },

    onCollapsedFriends({show}){
      console.debug('Friend: collapsed show = ', show)
      // if(show && this.recipes.length === 0) this.getRecipes()
    },


    setListenersForUserSigned(){
      this.$bus.$on('recipe:create', this.fetchRecipe.bind(this))
      this.$bus.$on('recipe:update', this.onUpdatedRecipeListeners.bind(this))
      this.$bus.$on('recipe:delete', this.fetchRecipe.bind(this))

      this.$bus.$on('friend:add', this.fetchFriend.bind(this))
      this.$bus.$on('friend:remove', this.fetchFriend.bind(this))
    },

    unsetListenersForUserSigned(){
      this.$bus.$off('recipe:create', this.fetchRecipe.bind(this))
      this.$bus.$off('recipe:update', this.onUpdatedRecipeListeners.bind(this))
      this.$bus.$off('recipe:delete', this.fetchRecipe.bind(this))

      this.$bus.$off('friend:add', this.fetchFriend.bind(this))
      this.$bus.$off('friend:remove', this.fetchFriend.bind(this))
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
    onUpdateUserInfoListeners(userInfo){
      if(userInfo) this.friends.filter(f => f.user?._id === userInfo._id).forEach(f => this._updateUserInformation(f.user, userInfo))
    },
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
    this.pendingRequests = QueuePendingRequests.create()

    this.$bus.$on('user:update:info', this.onUpdateUserInfoListeners.bind(this))
    this.$bus.$on('user:delete', this.onDeleteUser.bind(this))
  },
  beforeDestroy() {
    this.pendingRequests.cancelAll('One user cancel.')
    if(this.$data._userIsSigned) this.unsetListenersForUserSigned()

    this.$bus.$on('user:update:info', this.onUpdateUserInfoListeners.bind(this))
    this.$bus.$off('user:delete', this.onDeleteUser.bind(this))
  }
}
</script>

<style scoped>
</style>
