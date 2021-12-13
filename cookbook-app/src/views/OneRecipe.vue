<template>
  <b-skeleton-wrapper :loading="isNotLoaded">
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
              <b-col cols="2" align="end">
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
              <b-col align="end" cols="2" >  <b-skeleton width="100%" /></b-col>
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

    <b-row cols="1" class="mx-0" v-if="!isNotLoaded">

      <b-col class="mb-3">
        <b-breadcrumb :items="itemsBreadcrumb" />
      </b-col>

      <b-col class="header-recipe py-3 mb-4">
        <b-container fluid>
          <b-row align-h="between" align-v="center">
            <b-col>
              <b-row align-h="center" align-v="center">
                <b-col align="start" cols="2" class="px-0" v-if="doc.country">
                  <country-image v-model="doc.country"/>
                </b-col>
                <b-col class="px-0">
                  <h2>{{ doc.name }}</h2>
                </b-col>
              </b-row>
            </b-col>
            <b-col cols="2" align="end">
              <like v-model="doc.likes" :recipe="{id: doc._id, ownerID: doc.owner._id}" :no-like="youNotMakeLike"/>
            </b-col>
          </b-row>
          <b-row class="mt-2" align-h="between">
            <b-col class="px-0" v-if="doc.category"> {{ doc.category | nameCategory }} </b-col>
            <b-col v-if="doc.diet"> {{ doc.diet | nameDiet }} </b-col>
            <b-col align="end"> {{ doc.createdAt | dateFormat }}</b-col>
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

      <b-col class="mt-5">
        <strong>Commenti</strong>
        <comments v-model="doc.comments" :recipe="{id: doc._id, ownerID: doc.owner._id}" />
      </b-col>
    </b-row>

  </b-skeleton-wrapper>
</template>

<script>
import {isEmpty, dateFormat} from "@services/utils"
import {Diets, RecipeCategories} from "@services/app"

import api from '@api'

import {mapGetters} from "vuex";

export default {
  name: "OneRecipe",
  data(){
    return {
      loading: true,
      itemsBreadcrumb: [],
      doc: {}
    }
  },
  computed: {

    ...mapGetters(['userIdentifier', 'username', 'accessToken', 'isAdmin']),

    isNotLoaded(){
      return !this.doc || (isEmpty(this.doc.owner) && isEmpty(this.doc.recipe))
    },

    youNotMakeLike(){
      return this.isAdmin || this.doc.owner._id === this.userIdentifier
    }
  },
  filters: {
    dateFormat: dateFormat,
    nameCategory(text){
      let category = RecipeCategories.find(text)
      return category ? category.text : ''
    },
    nameDiet(text){
      let diet = Diets.find(text)
      return diet ? diet.text : ''
    },
  },
  methods: {
    isOwner(owner_recipe) {
      return owner_recipe._id === this.userIdentifier && owner_recipe.userID === this.username
    },
    getRecipe() {
      let {id, recipe_id} = this.$route.params;

      api.recipes.getRecipe(id, recipe_id, 'shared', this.accessToken)
      .then(({data})=>{
        this.doc = data
        console.debug(this.doc)
        if(this.doc) {
          this.itemsBreadcrumb = [
            {text: this.doc.owner.userID, to: { name: 'single-user', params: {id: this.$route.params.id} } },
            {text: this.doc.name, active: true}
          ]
        }
      }).catch(err => {
        //TODO: HANDLER ERROR ONE RECIPE
        console.error(err.response)
      })
    }
  },
  mounted() {
    // setTimeout(this.getRecipe.bind(this), 1000)
    this.getRecipe()
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