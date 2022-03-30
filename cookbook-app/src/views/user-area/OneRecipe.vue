<template>
  <b-skeleton-wrapper :loading="processing">
    <template #loading>
      <b-row cols="1" cols-lg="2" class="mx-0">
        <b-col>
          <b-container fluid>
            <b-row cols="1">
              <b-col class="mb-3">
                <b-breadcrumb >
                  <b-skeleton width="20%" class="mt-2 mr-2" /> / <b-skeleton class=" mt-2 ml-2" width="30%" />
                </b-breadcrumb>
              </b-col>
              <b-col class="header-recipe my-4 px-0">
                <b-container fluid class="py-2">
                  <b-row class="m-3" align-h="between" align-v="center">
                    <b-col>
                      <b-row align-v="center" cols="1" cols-sm="2">
                        <b-col class="px-0">
                          <b-skeleton width="80%"/>
                        </b-col>
                        <b-col sm="2" class="text-left px-0" v-if="doc.country">
                          <b-skeleton-img card-img="top" aspect="2:1" />
                        </b-col>
                      </b-row>
                    </b-col>
                    <b-col v-if="doc.shared" cols="4" class="text-right">
                      <b-skeleton-icon icon="heart"></b-skeleton-icon>
                    </b-col>
                  </b-row>
                  <b-row class="m-3" cols="2"  align-h="start">
                    <b-col class="px-0"  cols="10">
                      <b-row cols="1">
                        <b-col> <b-skeleton width="30%"/></b-col>
                        <b-col> <b-skeleton width="40%"/></b-col>
                      </b-row>
                    </b-col>
                    <b-col class="px-0 text-right"  cols="2">  <b-skeleton width="100%"/></b-col>
                  </b-row>
                </b-container>
              </b-col>
              <b-col>
                <b-container class="px-0">
                  <b-row cols="1" cols-sm="1" cols-xl="2">
                    <b-col class="mb-3">
                      <strong>Ingredienti</strong>
                      <ingredient-list/>
                    </b-col>
                    <b-col class="px-0">
                      <div>
                        <b-col>
                          <strong>Preparazione</strong>
                          <div>
                            <b-skeleton width="85%"></b-skeleton>
                            <b-skeleton width="55%"></b-skeleton>
                            <b-skeleton width="70%"></b-skeleton>
                          </div>
                        </b-col>
                        <b-col class="mt-2">
                          <strong>Note</strong>
                          <div>
                            <b-skeleton width="85%"></b-skeleton>
                            <b-skeleton width="55%"></b-skeleton>
                            <b-skeleton width="70%"></b-skeleton>
                          </div>
                        </b-col>
                      </div>
                    </b-col>
                  </b-row>
                  <b-row>
                    <b-col class="mt-2">
                      <strong class="sr-only">Valori Nutrizionali</strong>
                      <nutrients-table />
                    </b-col>
                  </b-row>
                </b-container>
              </b-col>
            </b-row>
          </b-container>
        </b-col>
        <b-col>
          <b-container fluid>
            <b-row cols="1">
              <b-col>
                <b-skeleton-img></b-skeleton-img>
              </b-col>
              <b-col class="mt-3">
                <strong class="sr-only">Commenti</strong>
                <div class="skeleton-card-comments">
                  <b-skeleton width="85%"></b-skeleton>
                  <b-skeleton width="55%"></b-skeleton>
                  <b-skeleton width="70%"></b-skeleton>
                </div>
              </b-col>
            </b-row>
          </b-container>
        </b-col>
      </b-row>
    </template>

    <b-container v-if="doc" :class="areThereComments ? 'col-lg-11' : ''">
      <b-row cols="1" :cols-lg="areThereComments? 2: 1" class="mx-0">
        <b-col>
          <b-container fluid>
            <b-row cols="1">

              <b-col class="mb-3" v-if="itemsBreadcrumb.length">
                <b-breadcrumb :items="itemsBreadcrumb" />
              </b-col>

              <b-col class="header-recipe my-4 px-0">
                <preview-recipe-image class="col px-0 h-100" v-model="doc.img" without-default/>
                <b-container fluid class="py-2">
                  <b-row class="m-3" align-h="between" align-v="center">
                    <b-col>
                      <b-row align-v="center" cols="1" cols-sm="2">
                        <b-col class="px-0">
                          <strong>{{ doc.name }}</strong>
                        </b-col>
                        <b-col sm="2" class="text-left px-0" v-if="doc.country">
                          <country-image v-model="doc.country"/>
                        </b-col>
                      </b-row>
                    </b-col>
                    <b-col v-if="doc.shared" cols="4" class="text-right">
                      <like v-model="doc.likes" :recipe="doc" :no-like="youNotMakeLike" variant="secondary"/>
                    </b-col>
                  </b-row>
                  <b-row class="m-3" cols="2"  align-h="start">
                    <b-col v-if="doc.category || doc.diet" class="px-0">
                      <b-row cols="1">
                        <b-col v-if="doc.category">{{ nameCategory(doc.category) }}</b-col>
                        <b-col v-if="doc.diet">{{ nameDiet(doc.diet) }} </b-col>
                      </b-row>
                    </b-col>
                    <b-col class="px-0 text-right"> {{ doc.createdAt | dateFormat }}</b-col>
                  </b-row>
                </b-container>
              </b-col>

              <b-col class="px-0">
                <b-container class="px-0">
                  <b-row cols="1" cols-sm="1" cols-xl="2">
                    <b-col class="mb-3">
                      <strong>Ingredienti</strong>
                      <ingredient-list v-model="doc.ingredients"/>
                    </b-col>
                    <b-col class="px-0">
                      <div>
                        <b-col>
                          <strong>Preparazione</strong>
                          <p class="text-break"> {{ doc.preparation }} </p>
                        </b-col>
                        <b-col v-if="doc.note" class="mt-2">
                          <strong>Note</strong>
                          <p class="text-break"> {{ doc.note }} </p>
                        </b-col>
                      </div>
                    </b-col>
                  </b-row>
                  <b-row>
                    <b-col class="mt-2">
                      <strong class="sr-only">Valori Nutrizionali</strong>
                      <nutrients-table :ingredients="doc.ingredients"/>
                    </b-col>
                  </b-row>
                </b-container>
              </b-col>

            </b-row>
          </b-container>
        </b-col>

        <b-col>
          <b-container fluid>
            <b-row cols="1" align-h="center">
              <preview-recipe-tutorial class="recipe-tutorial col col-10 mb-3" v-model="doc.tutorial" :poster="doc.img" />
              <b-col v-if="showCommentArea">
                <strong class="sr-only">Commenti</strong>
                <comments v-model="doc.comments" :recipe="doc" />
              </b-col>
            </b-row>
          </b-container>
        </b-col>
      </b-row>
    </b-container>
    <not-found v-else asset="recipe" />
  </b-skeleton-wrapper>
</template>

<script>

import {mapGetters} from "vuex";
import NotFound from "../404";
import {QueuePendingRequests} from "@api/request";
import UserMixin from "@mixins/user.mixin"
export default {
  name: "OneRecipe",
  mixins: [UserMixin],
  props: {
    value: Object | Boolean
  },
  components: {NotFound},
  data(){
    return {
      loading: true,
      pendingRequests: null,
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
      isAdmin: 'session/isAdmin'
    }),

    showCommentArea(){
      return this.doc.shared && !( !this.doc.owner && this.doc.comments?.length === 0 )
    },
    areThereComments(){
      return this.doc && this.doc.shared && this.doc.comments.length > 0
    },

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
      let _idRequest = 'one-recipe'
      let options = QueuePendingRequests.makeOptions(this.pendingRequests, _idRequest)

      let {id, recipe_id} = this.$route.params;
      this.processing = true
      this.$store.dispatch('recipes/one-shared', {ownerID: id, recipeID: recipe_id, options})
         .then(({data}) => this.setRecipe(data))
         .catch(err => this.handleRequestErrors.recipes.getRecipe(err))
         .then(processingEnd => this.processing = !processingEnd)
         .then(() => this.pendingRequests.remove(_idRequest))
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
    onUpdateUserInfoListeners(userInfo){
      if(userInfo){
        if(this.doc.owner && this.doc.owner._id === userInfo._id) {
          this._updateUserInformation(this.doc.owner, userInfo)
          this.itemsBreadcrumb[0].text = userInfo.userID
        }
        /* NOTE: the update of this.doc.permission, this.doc.ingredients has no effect on GUI:  */
        if(this.doc.permission.length) {
          const foundUserPermission = this.doc.permission.find(p => p.user && p.user._id === userInfo._id)
          this._updateUserInformation(foundUserPermission && foundUserPermission.user, userInfo)
        }
        if(this.doc.ingredients.length) {
          this.doc
              .ingredients
              .filter(i => i.food.owner && i.food.owner._id === userInfo._id)
              .forEach(i => this._updateUserInformation(i.food.owner, userInfo))
        }
      }
    }
  },
  created() {
    this.pendingRequests = QueuePendingRequests.create()
    this.$bus.$on('recipe:update', this.onUpdatedRecipeListeners.bind(this))
    this.$bus.$on('recipe:delete', this.onDeletedRecipeListeners.bind(this))

    this.$bus.$on('user:delete', this.onDeletedUserListeners.bind(this))
    this.$bus.$on('user:update:info', this.onUpdateUserInfoListeners.bind(this))

    if(typeof this.value === "undefined") this.getRecipe()
    else if(this.value !== false) {
      this.setRecipe(this.value)
      this.processing = false
    }
  },
  beforeDestroy() {
    this.pendingRequests.cancelAll('One recipe cancel.')
    this.$bus.$off('recipe:update', this.onUpdatedRecipeListeners.bind(this))
    this.$bus.$off('recipe:delete', this.onDeletedRecipeListeners.bind(this))

    this.$bus.$off('user:delete', this.onDeletedUserListeners.bind(this))
    this.$bus.$off('user:update:info', this.onUpdateUserInfoListeners.bind(this))
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
  color: white;
  position: relative;
  height: 205px;
  border-radius: 25px;
  & img {
    border-radius: 25px;
  }
  & > div{
    border-radius: 25px;
    position: absolute;
    top: 0;
    background-color: $overlay;
    & strong {
      font-size: 18pt;
    }
  }
}

::v-deep.recipe-tutorial > video{
  border-radius: 10px;
}
</style>
