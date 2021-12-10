<template>
  <wrap-loading v-model="processingSearch" >

    <b-row  cols="1" cols-sm="1" cols-lg="2">
      <b-col cols="12" sm="12" :lg="isDesktop && showMap ? 5: 12" :xl="isDesktop &&  showMap ? 4: 12" class="mb-2">
        <b-row>
          <b-col>
            <b-card>
              <b-container fluid>
                <b-row cols="1">
                  <b-col>
                    <b-form-group label-for="search-recipe-input">
                      <template #label> <strong>Ricerca</strong> </template>
                      <b-input-group >
                        <b-input-group-prepend>
                          <b-icon-book scale="2x" class="mt-2 ml-2 mr-3"/>
                        </b-input-group-prepend>
                        <b-form-input id="search-recipe-input" type="search" v-model="filters.name" @keypress.enter="search" placeholder="Inserisci nome ricetta completo o parziale" :disabled="loading"/>
                        <b-input-group-append>
                          <b-button id="filters-form" variant="info" v-b-toggle.search-filters> <b-icon-filter scale="2x" /></b-button>
                          <b-tooltip target="filters-form">Filtri</b-tooltip>
                        </b-input-group-append>
                      </b-input-group>
                    </b-form-group>
                    <b-collapse id="search-filters" ref="collapse-filters" :visible="withAllFiltersVisible" @show="_onShowFilters" @hide="_onHideFilters">
                      <b-container fluid >
                        <b-row cols="1" class="mt-3">
                          <b-col class="mb-2"> <strong>Regimi alimentari</strong> </b-col>
                          <b-col > <checkbox-pill-button v-model="filters.diets" :options="diets" class="w-100"/> </b-col>
                        </b-row>
                        <b-row cols="1" class="mt-3">
                          <b-col class="mb-2"> <strong>Categorie</strong> </b-col>
                          <b-col> <checkbox-pill-button v-model="filters.categories" :options="categories" class="w-100"/> </b-col>
                        </b-row>
                        <b-row cols="1" class="mt-3">
                          <b-col class="mb-2"> <strong>Paesi</strong> </b-col>
                          <b-col> <checkbox-pill-button v-model="filters.countries" :options="countries" class="w-100"/> </b-col>
                        </b-row>
                        <b-row cols="1" class="mt-3">
                          <b-col>  <strong>Ingredienti</strong> </b-col>
                          <food-finder ref="food-finder" class="food-finder-container" @found="onAddIngredient" barcode-search/>
                          <b-col>
                            <b-list-group>
                              <b-list-group-item v-for="(ingredient, index) in filters.ingredients" :key="ingredient._id">
                                <b-row align-v="center">
                                  <b-col>{{ingredient.name}} </b-col>
                                  <b-col align="end">
                                    <b-button :id="ingredient._id" variant="danger" @click="onRemoveIngredient(index)"><b-icon-trash-fill/></b-button>
                                    <b-tooltip :target="ingredient._id">Rimuovi</b-tooltip>
                                  </b-col>
                                </b-row>
                              </b-list-group-item>
                            </b-list-group>
                          </b-col>
                        </b-row>
                      </b-container>
                    </b-collapse>
                  </b-col>
                  <b-col>
                    <b-row class="mt-3">
                      <b-col align-self="end" align="end">
                        <b-row>
                          <b-col align-self="start" align="start">
                            <b-button variant="secondary" @click="_resetFormSearch">Reset</b-button>
                          </b-col>
                          <b-col align-self="end" align="end">
                            <b-button variant="primary" @click="search">Cerca</b-button>
                          </b-col>
                        </b-row>
                      </b-col>
                    </b-row>
                  </b-col>
                </b-row>
              </b-container>
            </b-card>
          </b-col>
        </b-row>
      </b-col>
      <b-col cols="12" sm="12" lg="7" xl="8" v-if="isDesktop">
        <world-map v-model="filters.countries" :countries="countries" :visibility="showMap"/>
      </b-col>
    </b-row>

    <b-row v-if="isNewSearch" class="search-result-container" cols="1">
      <b-col class="mt-4"> <p><strong>Filtri applicati: </strong></p> </b-col>
      <b-col class="search-result-header" >
        <b-container v-if="!this.noApplyFilters" fluid>
          <b-row cols="1" cols-sm="2" cols-md="3" cols-lg="4" cols-xl="5" align-v="center">
            <b-col v-if="filters.name" class="filters">
              <font-awesome-icon icon="minus" @click="removeFilter('name')"/> <span> {{filters.name}} </span>
            </b-col>
            <b-col v-for="(diet, index) in filters.diets" :key="diet" class="filters">
              <font-awesome-icon icon="minus" @click="removeFilter('diets', index)"/> <span>{{diet | fullName}}</span>
            </b-col>
            <b-col v-for="(category, index) in filters.categories" :key="category" class="filters">
              <font-awesome-icon icon="minus" @click="removeFilter('categories', index)"/> <span>{{category | fullName }}</span>
            </b-col>
            <b-col v-for="(country, index) in filters.countries" :key="country" class="filters">
              <font-awesome-icon icon="minus" @click="removeFilter('countries', index)"/> <span>{{country | fullName}}</span>
            </b-col>
            <b-col v-for="(ingredient, index) in filters.ingredients" :key="ingredient._id" class="filters">
              <font-awesome-icon icon="minus" @click="removeFilter('ingredients', index)"/> <span>{{ingredient.name}}</span>
            </b-col>
          </b-row>
        </b-container>
        <div v-else>Nessun filtro.</div>
      </b-col>
      <b-col class="mt-4"> <p><strong>Risultati: </strong></p> </b-col>
      <b-col class="search-result-body mt-2">
        <b-container fluid v-if="docs.length" >
          <b-row cols="1" cols-sm="2" cols-md="2" cols-lg="3" cols-xl="4">
            <b-col v-for="doc in docs" :key="doc._id" class="mb-3">
              <b-card class="recipe-found" :style="cssRecipeFound(doc)">
                <b-container fluid>
                  <b-row cols="1">
                    <b-col class="base-info py-2">
                      <b-row align-v="center">
                        <b-col cols="7">
                          <router-link :to="{name: 'single-recipe', params: {id: doc.owner._id, recipe_id: doc._id}}">
                            {{doc.name}}
                          </router-link>
                        </b-col>
                        <b-col cols="5" align="end" v-if="doc.category || doc.country">
                          <span style="float: left">{{ doc.category | fullName }}</span>
                          <country-image v-model="doc.country"  heigth="0"/>
                        </b-col>
                      </b-row>
                    </b-col>
                    <b-col align="end" class="mt-2">
                      <recipe-details :recipe="doc" class="details-recipes" all-info/>
                    </b-col>
                  </b-row>
                </b-container>
              </b-card>
            </b-col>
          </b-row>
        </b-container>
        <div v-else>Nessun risultato. </div>
      </b-col>
    </b-row>

  </wrap-loading>
</template>

<script>
import {Diets, RecipeCategories, Countries} from '@services/app'
import {pushIfAbsent, isString, isEmpty, clone, equals} from '@services/utils'

import api from '@api'
import {Session} from "@services/session";

export default {
  name: "search-recipes",
  props: {
    withMap: {
      type: Boolean,
      default: false
    },
    withHistory: {
      type: Boolean,
      default: false
    },
    withAllFiltersVisible: {
      type: Boolean,
      default: false
    },
    triggerSearch: Function,
    showResults: {
      type: Boolean,
      default: true
    }
  },
  data(){
    return {
      _showMap: true,
      loading: true,

      countries: [],
      diets: [],
      categories: [],

      filters: {
        countries: [],
        diets: [],
        categories: [],
        ingredients: [],
        name: ''
      },

      docs: [],
      total: 0,
      processingSearch: false,
      searchingMode: false,
    }
  },
  watch:{
    filters:{
      deep: true,
      handler(val){
        // console.debug('Filters: ', JSON.stringify(val))
        if(this.searchingMode){
         // console.debug('Change filters = ', JSON.stringify(this.filters, null,2))
          if(this.noApplyFilters) this.back();
          else this.search()
        }
      }
    }
  },
  filters: {
    fullName(val) {
      let country = Countries.find(val)
      if(country) return country.text
      let diet = Diets.find(val)
      if(diet) return diet.text
      let category = RecipeCategories.find(val)
      if(category) return category.text
      return ''
    }
  },
  computed:{
    showMap(){
      return this.withMap && this.$data._showMap
    },
    isDesktop(){
      return screen.width >= 540;
    },

    isNewSearch(){
      return this.showResults && this.searchingMode && !this.processingSearch
    },

    noApplyFilters(){
      return Object.entries(this.filters).every(([k, v]) => v.length === 0)
    },

    routeQuery(){
      let query = this.$route.query
      // console.debug('Before Route query = ', query)
      if(query.diets && isString(query.diets)) query.diets = [query.diets]
      if(query.countries && isString(query.countries)) query.countries = [query.countries]
      if(query.categories && isString(query.categories)) query.categories = [query.categories]
      if(query.ingredients && isString(query.ingredients)) query.ingredients = [query.ingredients]
      // console.debug('Route query = ', query)
      return {...this.filters, ...query}
    },
  },
  methods: {
    _onShowFilters(){
      this.$data._showMap = true
    },
    _onHideFilters(){
      this.$data._showMap = false
    },
    _hideFilters(){
      if(this.$refs['collapse-filters'].show)
        this.$root.$emit('bv::toggle::collapse', 'search-filters')
    },
    _showFilters(){
      if(!this.$refs['collapse-filters'].show)
        this.$root.$emit('bv::toggle::collapse', 'search-filters')
    },

    recipeInfoId(doc){
      return 'info-recipe-'+doc._id
    },

    cssRecipeFound(doc){
      return {
        '--imageBackground': `url(${doc.img}), url(${require('@assets/images/recipe-image.jpg')})`,
      }
    },

    getNumberRecipesForCountry() {
      this.loading = true
      api.recipes
         .numberRecipesForCountry(Session.accessToken())
         .then(({data}) => {
           console.debug('Result rest api = ', data)

           this.countries = data.filter(cn => Countries.find(cn.country))
               .map(cn => ({...Countries.find(cn.country), ...{recipes: cn.number}}))

           if(this.withHistory) this._setFiltersFromRoute()
         })
         //TODO: HANDLER ERROR  Number Recipes For Country
         .catch(err => console.error(err))
         .finally(() => this.loading = false)
    },

    onAddIngredient(food){
      console.debug(`Add ingredient { _id: ${food._id}, name: ${food.name} }`)
      pushIfAbsent(this.filters.ingredients, food)
    },

    onRemoveIngredient(index){
      let food = this.filters.ingredients[index]
      console.debug(`Remove ingredient { _id: ${food._id}, name: ${food.name} }`)
      if(index >= 0) this.filters.ingredients.splice(index, 1)
    },

    _setFiltersFromRoute: async function (){
      this.filters = clone(this.routeQuery)
      if (this.filters.ingredients && this.filters.ingredients.length > 0) {
        const ingredients = []
        for (const id of this.filters.ingredients) {
          let food = await this.$refs['food-finder'].getFood(id)
          // console.debug('food ', food)
          if(!food._id) ingredients.push(food)
        }
        this.filters.ingredients = ingredients
      }
      console.debug('Set filters from route = ', JSON.stringify(this.filters, null,1 ))
      if (!this.noApplyFilters) this.search()
    },

    _resetSearchResult(){
      this.processingSearch = false
      this.searchingMode = false
      this.docs = []
      this.total = 0
      if(this.withHistory) this.$router.push({query: {}})

      this.$emit('reset')
    },

    _resetFormSearch(){
      this._resetSearchResult()
      this._showFilters()
      this.filters = {
        countries: [],
        diets: [],
        categories: [],
        ingredients: [],
        name: ''
      }
    },

    _pushInHistoryIfAbsent(filters){
      let q = this.routeQuery
      console.debug('filters : ', JSON.stringify(filters, null, 1))
      console.debug('routeQuery : ', JSON.stringify(q, null, 1))
      let inHistory = ( equals(filters.name, q.name) || (!filters.name && q.name==='') ) &&
                      equals(filters.diets, q.diets) &&
                      equals(filters.countries, q.countries) &&
                      equals(filters.categories, q.categories) &&
                      equals(filters.ingredients, q.ingredients)
      console.debug('In history = ', inHistory)
      console.debug('make push = ', (isEmpty(this.$route.query) || !inHistory))
      if((isEmpty(this.$route.query) || !inHistory)){
        console.debug('Push on history.')
        this.$router.push({query: filters})
      }
    },

    search(){
      this.processingSearch = true

      let filters = clone(this.filters)
      if(filters.ingredients.every(i => i._id && isString(i._id))) {
        console.debug('Map ingredients ids.')
        filters.ingredients = this.filters.ingredients.map(i => i._id)
      }
      if(filters.name.length === 0) delete filters.name

      if(this.withHistory) this._pushInHistoryIfAbsent(filters)

      console.debug('Search = ', JSON.stringify(filters))

      let promiseSearch = undefined
      if(this.triggerSearch) promiseSearch = this.triggerSearch(filters)
      else promiseSearch = api.recipes.allSharedRecipes(Session.accessToken(), {}, filters)

      promiseSearch
         .then(({data}) => {
            console.log('# Found Recipes = ', data.total)
            this.docs = data.items
            this.total = data.total
            if(!this.searchingMode) this.searchingMode = true
            this._hideFilters()

            this.$emit('searching', data)
         })
         //TODO: HANDLER ERROR  SEARCH BETWEEN SHARED RECIPES
         .catch(err => console.error(err))
         .finally(() => this.processingSearch = false)
    },

    removeFilter(type, index = -1){
      let filter = this.filters[type]
      if(Array.isArray(filter) && index >= 0) this.filters[type].splice(index, 1)
      else if(isString(filter)) this.filters[type] = ''
    },

    back(){
      console.debug('Back: no search .')
      this._resetSearchResult()
      this.$data._showMap = true
      this._showFilters()
    },
  },
  created() {
    this.diets = Diets.get().filter(d => d.value !== '')
    this.categories = RecipeCategories.get()

    if(this.withHistory) window.onpopstate = this._setFiltersFromRoute.bind(this)
  },
  mounted() {
    if(!this.triggerSearch) this.getNumberRecipesForCountry()
    else{
      this.countries = Countries.get()
      this.loading = false
    }
  }
}
</script>

<style lang="scss" scoped>

::v-deep div.food-finder-container > div > div {
  padding-left: 0.7rem!important;
  padding-right: 0.7rem!important;
}
.search-result-container{

  .search-result-header{
    & .filters {
      width: fit-content;
      float: left;
      padding: 0.7rem;
      & > svg{
        cursor: pointer;
      }
      & > span {
        padding-left: 10px;
      }
    }
  }
  .search-result-body {
    & .recipe-found{
      background-image: var(--imageBackground);
      background-size: cover;

      & div.card-body {
        padding: 1.25rem 0 ;
        color: white;
        & .base-info{
          background: $overlay;
        }
        & a {
          color: white;
          text-decoration: underline;
        }
      }
    }
  }
}


</style>