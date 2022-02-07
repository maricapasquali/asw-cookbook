<template>
  <b-skeleton-wrapper :loading="processing">
    <template #loading>
      <b-row cols="1" class="mx-0">
        <b-col class="mb-3">

          <b-breadcrumb >
            <b-skeleton width="20%" class="mt-2 mr-2" /> / <b-skeleton class=" mt-2 ml-2" width="30%" />
          </b-breadcrumb>

        </b-col>
        <b-col class="header-recipe py-3">
          <b-container fluid>
            <b-row align-h="between" align-v="center">
              <b-col>
                <b-row align-h="center" align-v="center">
                  <b-col cols="2" class="pl-0">
                   <b-skeleton-img card-img="top" aspect="2:1" />
                  </b-col>
                  <b-col class="px-0">  <b-skeleton width="55%" /> </b-col>
                </b-row>
              </b-col>
              <b-col cols="2" class="text-right">
                <b-skeleton-icon icon="heart"></b-skeleton-icon>
              </b-col>
            </b-row>
            <b-row class="mt-2" align-h="between">
              <b-col cols="8">
                <b-row>
                  <b-col class="px-0" cols="4">
                    <b-skeleton width="80%" />
                  </b-col>
                  <b-col class="px-0" cols="4">
                    <b-skeleton width="80%" />
                  </b-col>
                </b-row>
              </b-col>
              <b-col class="text-right" cols="2" >  <b-skeleton width="100%" /></b-col>
            </b-row>
          </b-container>
        </b-col>
        <b-col class="mt-5">
          <strong>Ingredienti</strong>
          <ingredient-list/>
        </b-col>
        <b-col class="mt-5">
          <strong>Preparazione</strong>
          <div>
            <b-skeleton width="85%"></b-skeleton>
            <b-skeleton width="55%"></b-skeleton>
            <b-skeleton width="70%"></b-skeleton>
          </div>
        </b-col>
        <b-col class="mt-5">
          <strong>Note</strong>
          <div>
            <b-skeleton width="85%"></b-skeleton>
            <b-skeleton width="55%"></b-skeleton>
            <b-skeleton width="70%"></b-skeleton>
          </div>
        </b-col>
        <b-col class="mt-5">
          <strong>Valori Nutrizionali</strong>
          <nutrients-table />
        </b-col>
        <b-col class="mt-5">
          <strong>Commenti</strong>
          <div class="skeleton-card-comments">
            <b-skeleton width="85%"></b-skeleton>
            <b-skeleton width="55%"></b-skeleton>
            <b-skeleton width="70%"></b-skeleton>
          </div>

        </b-col>
      </b-row>
    </template>

    <b-row cols="1" class="mx-0" v-if="doc">

      <b-col class="mb-3" v-if="itemsBreadcrumb.length">
        <b-breadcrumb :items="itemsBreadcrumb" />
      </b-col>

      <b-col class="header-recipe py-3 mb-4">
        <b-container fluid>
          <b-row align-h="between" align-v="center">
            <b-col>
              <b-row align-h="center" align-v="center">
                <b-col cols="2" class="text-left px-0" v-if="doc.country">
                  <country-image v-model="doc.country"/>
                </b-col>
                <b-col class="px-0">
                  <h2>{{ doc.name }}</h2>
                </b-col>
              </b-row>
            </b-col>
            <b-col v-if="doc.shared" cols="2" class="text-right">
              <like v-model="doc.likes" :recipe="doc" :no-like="youNotMakeLike"/>
            </b-col>
          </b-row>
          <b-row class="mt-2" align-h="between">
            <b-col class="px-0" v-if="doc.category"> {{ nameCategory(doc.category) }} </b-col>
            <b-col v-if="doc.diet"> {{ nameDiet(doc.diet) }} </b-col>
            <b-col class="text-right"> {{ doc.createdAt | dateFormat }}</b-col>
          </b-row>
        </b-container>
      </b-col>

      <!-- TODO: improve view for image and tutorial video -->
      <preview-recipe-image class="col col-6" v-model="doc.img" without-default/>
      <preview-recipe-tutorial class="col col-6" v-model="doc.tutorial" :poster="doc.img" />

      <b-col class="mt-5">
        <strong>Ingredienti</strong>
        <ingredient-list v-model="doc.ingredients"/>
      </b-col>

      <b-col class="mt-5">
        <strong>Preparazione</strong>
        <p> {{ doc.preparation }} </p>
      </b-col>

      <b-col v-if="doc.note" class="mt-5">
        <strong>Note</strong>
        <p> {{ doc.note }} </p>
      </b-col>

      <b-col class="mt-5">
        <strong>Valori Nutrizionali</strong>
        <nutrients-table :ingredients="doc.ingredients"/>
      </b-col>

      <b-col class="mt-5" v-if="doc.shared">
        <strong>Commenti</strong>
        <comments v-model="doc.comments" :recipe="doc" />
      </b-col>
    </b-row>
    <not-found v-else asset="recipe"/>

  </b-skeleton-wrapper>
</template>

<script>

import api from '@api'

import {mapGetters} from "vuex";
import {scrollToRouterHash} from "@router";
import NotFound from "./404";
import {Server} from "@api";
export default {
  name: "OneRecipe",
  props: {
    value: Object | Boolean
  },
  components: {NotFound},
  data(){
    return {
      loading: true,
      itemsBreadcrumb: [],
      processing: true,
      doc: ''
    }
  },
  computed: {

    ...mapGetters(['getDietByValue', 'getRecipeCategoryByValue']),
    ...mapGetters({
      userIdentifier: 'session/userIdentifier',
      username: 'session/username',
      accessToken: 'session/accessToken',
      isAdmin: 'session/isAdmin'
    }),

    youNotMakeLike(){
      return this.isAdmin || !this.doc.owner || this.doc.owner._id === this.userIdentifier
    }
  },
  watch: {
    value(val, old){
      if(val) this.setRecipe(val)
      this.processing = false
    }
  },
  filters: {
    dateFormat: function (text){
      return dateFormat(text)
    }
  },
  methods: {
    scrollToRouterHash,

    nameCategory(text){
      return this.getRecipeCategoryByValue(text)?.text || ''
    },
    nameDiet(text){
      return this.getDietByValue(text)?.text || ''
    },

    isOwner(owner_recipe) {
      return owner_recipe._id === this.userIdentifier && owner_recipe.userID === this.username
    },
    setRecipe(data){
      this.doc = data
      console.debug(this.doc)
      if(this.doc && this.doc.owner) {
        this.itemsBreadcrumb = [
          {text: this.doc.owner.userID, to: { name: 'single-user', params: {id: this.doc.owner._id} } },
          {text: this.doc.name, active: true}
        ]
      }
      return true
    },
    getRecipe() {
      let {id, recipe_id} = this.$route.params;
      this.processing = true
      api.recipes
         .getRecipe(id, recipe_id, 'shared', this.accessToken)
         .then(({data}) => this.setRecipe(data))
         .catch(err => this.handleRequestErrors.recipes.getRecipe(err))
         .then(processingEnd => this.processing = !processingEnd)
    },

    /* Listeners notification */
    onUpdatedRecipeListeners(_, recipe){
      if(recipe && this.doc._id === recipe._id) this.doc = recipe
    },
    onDeletedRecipeListeners(_, recipe){
      if(recipe && this.doc._id === recipe) this.doc = ''
    },
    /* Listeners updates */
    onDeletedUserListeners(id){
      if(this.doc && this.doc.owner && this.doc.owner._id === id) {
        this.doc.owner = null
        this.itemsBreadcrumb = []
        if(this.$route.name !== 'recipe') this.$router.replace({ name: 'recipe', params: { recipe_id: this.doc._id }})
      }
    },
    _onUpdateUserInfos(user, newInfos){
      if(newInfos.information) user.img = newInfos.information.img ? Server.images.path(newInfos.information.img) : ''
      if(newInfos.userID) user.userID = newInfos.userID
    },
    onUpdateUserInfoListeners(userInfo){
      if(userInfo){
        if(this.doc.owner && this.doc.owner._id === userInfo._id) {
          this._onUpdateUserInfos(this.doc.owner, userInfo)
          this.itemsBreadcrumb[0].text = userInfo.userID
        }
        /* NOTE: the update of this.doc.permission, this.doc.ingredients has no effect on GUI:  */
        if(this.doc.permission.length) {
          const foundUserPermission = this.doc.permission.find(p => p.user && p.user._id === userInfo._id)
          this._onUpdateUserInfos(foundUserPermission && foundUserPermission.user, userInfo)
        }
        if(this.doc.ingredients.length) {
          this.doc
              .ingredients
              .filter(i => i.food.owner && i.food.owner._id === userInfo._id)
              .forEach(i => this._onUpdateUserInfos(i.food.owner, userInfo))
        }
      }
    }
  },
  created() {
    this.$bus.$on('recipe:update', this.onUpdatedRecipeListeners.bind(this))
    this.$bus.$on('recipe:delete', this.onDeletedRecipeListeners.bind(this))

    this.$bus.$on('user:delete', this.onDeletedUserListeners.bind(this))
    this.$bus.$on('user:update:info', this.onUpdateUserInfoListeners.bind(this))
  },
  beforeDestroy() {
    this.$bus.$off('recipe:update', this.onUpdatedRecipeListeners.bind(this))
    this.$bus.$off('recipe:delete', this.onDeletedRecipeListeners.bind(this))

    this.$bus.$off('user:delete', this.onDeletedUserListeners.bind(this))
    this.$bus.$off('user:update:info', this.onUpdateUserInfoListeners.bind(this))
  },
  mounted() {
    if(typeof this.value === "undefined") this.getRecipe()
    else if(this.value !== false) {
      this.setRecipe(this.value)
      this.processing = false
    }
  },
  updated() {
    console.log('Update one recipe page....')
    this.scrollToRouterHash()
  }
}
</script>

<style lang="scss" scoped>
.skeleton-card-comments {
  background-color: $component-color;
  padding: 10px;
  border-radius: 5px;
}


.header-recipe{
  background-color: $overlay;
  color: white;
}
</style>