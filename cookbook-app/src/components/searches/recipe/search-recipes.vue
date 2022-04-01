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
                        <template #prepend>
                          <b-input-group-text><b-icon-book /></b-input-group-text>
                        </template>
                        <b-form-input id="search-recipe-input" type="search" v-model="filters.name" @keypress.enter="search" placeholder="Inserisci nome ricetta completo o parziale" />
                        <b-input-group-append>
                          <b-button title="Filtri" variant="info" v-b-toggle.search-filters> <b-icon-filter scale="2x" /></b-button>
                        </b-input-group-append>
                      </b-input-group>
                    </b-form-group>
                    <b-collapse id="search-filters" ref="collapse-filters" v-model="$data._showAllFilters" @show="_onShowFilters" @hide="_onHideFilters">
                      <b-container fluid >
                        <b-row cols="1" class="mt-3">
                          <b-col class="mb-2"> <strong>Regimi alimentari</strong> </b-col>
                          <b-col > <checkbox-pill-button v-model="filters.diets" :options="diets" class="w-100"/> </b-col>
                        </b-row>
                        <b-row cols="1" class="mt-3">
                          <b-col class="mb-2"> <strong>Categorie</strong> </b-col>
                          <b-col> <checkbox-pill-button v-model="filters.categories" :options="categories" class="w-100"/> </b-col>
                        </b-row>
                        <b-row cols="1" class="mt-3" v-if="countries.length">
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
                                  <b-col class="text-right">
                                    <b-button title="Rimuovi" variant="danger" @click="onRemoveIngredient(index)"><b-icon-trash-fill/></b-button>
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
                      <b-col align-self="end" class="text-right">
                        <b-row>
                          <b-col align-self="start" class="text-left">
                            <b-button variant="secondary" @click="_resetFormSearch">Reset</b-button>
                          </b-col>
                          <b-col align-self="end" class="text-right">
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
      <b-col cols="12" sm="12" lg="7" xl="8" v-if="isDesktop && withMap">
        <world-map v-model="filters.countries" :countries="countries" :visibility="showMap"/>
      </b-col>
    </b-row>

    <b-row v-if="isNewSearch" class="search-result-container" cols="1">
      <b-col class="mt-4"> <p><strong>Filtri applicati: </strong></p> </b-col>
      <b-col class="search-result-header" >
        <b-container v-if="!this.noApplyFilters" fluid>
          <b-row cols="1" cols-sm="2" cols-md="3" cols-lg="4" cols-xl="5" align-v="center">
            <filter-apply v-if="filters.name" class="filters"
                          @remove="removeFilter('name')" :filter-name="filters.name" />

            <filter-apply  v-for="(diet, index) in filters.diets" :key="diet" class="filters"
                           @remove="removeFilter('diets', index)">
                <template #filter-name>{{ _fullName(diet) }} </template>
            </filter-apply>

            <filter-apply v-for="(category, index) in filters.categories" :key="category" class="filters"
                          @remove="removeFilter('categories', index)">
              <template #filter-name>{{ _fullName(category) }} </template>
            </filter-apply>

            <filter-apply v-for="(country, index) in filters.countries" :key="country" class="filters"
                          @remove="removeFilter('countries', index)">
              <template #filter-name>{{ _fullName(country) }} </template>
            </filter-apply>

            <filter-apply v-for="(ingredient, index) in filters.ingredients" :key="ingredient._id" class="filters"
                          @remove="removeFilter('ingredients', index)" :filter-name="ingredient.name" />

          </b-row>
        </b-container>
        <div v-else>Nessun filtro.</div>
      </b-col>
      <b-col id="searching-result" class="mt-4"> <p><strong>Risultati: </strong></p> </b-col>
      <b-col class="search-result-body mt-2">
        <b-container fluid v-if="docs.length" >
          <b-row cols="1" cols-sm="2" cols-md="2" cols-lg="3" cols-xl="4">
            <b-col v-for="(doc, index) in docs" :key="doc._id" class="recipe-found-container mb-3 ">
              <router-link :to="_routeRecipe(doc)">
                <b-card class="recipe-found" body-class="py-0">
                  <preview-recipe-image v-model="doc.img" />
                  <b-container fluid>
                    <b-row cols="1">
                      <b-col class="base-info py-2">
                        <b-row align-v="center" align-h="between">
                          <b-col cols="7"> {{doc.name}} </b-col>
                          <b-col cols="5" class="text-right" v-if="doc.category || doc.country">
                            <b-row>
                              <b-col> <span>{{ _fullName(doc.category) }}</span> </b-col>
                              <b-col v-if="doc.country" class="pl-0"> <country-image v-model="doc.country" heigth="0" :id="index"/> </b-col>
                            </b-row>
                          </b-col>
                        </b-row>
                      </b-col>
                    </b-row>
                  </b-container>
                </b-card>
              </router-link>
              <div class="recipe-found-details-container">
                <recipe-details :recipe="doc" class="details-recipes"/>
              </div>
            </b-col>
          </b-row>
        </b-container>
        <div v-else>Nessun risultato. </div>
      </b-col>
    </b-row>

  </wrap-loading>
</template>

<script>

import UserMixin from '@mixins/user.mixin'
import PendingRequestMixin from "@mixins/pending-request.mixin"
import {mapGetters} from "vuex";

export default {
  name: "search-recipes",
  mixins: [UserMixin, PendingRequestMixin],
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
      _showAllFilters: false,
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
  computed:{
    ...mapGetters(['getCountryByValue', 'getRecipeCategoryByValue', 'getDietByValue']),
    ...mapGetters({
      categories: 'recipeCategories',
      diets: 'concreteDiets',
      accessToken: 'session/accessToken'
    }),

    showMap(){
      return this.withMap && this.$data._showMap && this.countries.length >0
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
      console.debug('---> Route query = ', query)
      return {...this.filters, ...query}
    },
  },
  methods: {
    _routeRecipe(doc){
      return { name: doc.owner?._id ? 'single-recipe' : 'recipe', params: { id: doc.owner?._id, recipe_id: doc._id }}
    },

    _fullName(val) {
      let country = this.getCountryByValue(val)
      if(country) return country.text
      let diet = this.getDietByValue(val)
      if(diet) return diet.text
      let category = this.getRecipeCategoryByValue(val)
      if(category) return category.text
      return ''
    },

    _onShowFilters(){
      this.$data._showMap = true
    },
    _onHideFilters(){
      this.$data._showMap = false
    },
    _hideFilters(){
      if(this.$data._showAllFilters) this.$data._showAllFilters = false
    },
    _showFilters(){
      if(!this.$data._showAllFilters) this.$data._showAllFilters = true
    },

    recipeInfoId(doc){
      return 'info-recipe-'+doc._id
    },

    getNumberRecipesForCountry() {
      let _id = 'number-for-country'
      let options = this.makeRequestOptions(_id)

      this.$store.dispatch('recipes/number-for-country', { options })
         .then(({data}) => {
           console.debug('Result rest api = ', data)

           this.countries = data.filter(cn => this.getCountryByValue(cn.country))
               .map(cn => ({...this.getCountryByValue(cn.country), ...{recipes: cn.number}}))

           if(this.withHistory) this._setFiltersFromRoute()
           console.debug('this.countries = ', this.countries)
           return true
         })
         .catch(err => this.handleRequestErrors.recipes.getNumberRecipesForCountry(err))
         .then(() => this.pendingRequests.remove(_id))
    },

    isFiltered(recipe, onlyShared = true){
      let {name, countries, diets, categories, ingredients} = this.filters

      let ingredientsId = ingredients.map(ingredient => ingredient._id)

      let _name = name.length === 0 || recipe.name.search(`^${name}`) !==-1
      let _country = countries.length === 0 || countries.includes(recipe.country?.value || recipe.country)
      let _diet = diets.length === 0 || diets.includes(recipe.diet?.value || recipe.diet)
      let _category = categories.length === 0 || categories.includes(recipe.category?.value || recipe.category)
      let _ingrentients = ingredients.length === 0 || recipe.ingredients.map(ingredient => ingredient.food._id).every(i => ingredientsId.includes(i))

      const _isFiltered = _name && _country && _diet && _category && _ingrentients
      //console.debug('_name => ', _name)
      //console.debug('_country => ', _country)
      // console.debug('_diet => ', _diet)
      //console.debug('_category => ', _category)
      //console.debug('_ingrentients => ', _ingrentients)
      console.debug('Recipe is filtered: ', ((onlyShared && recipe.shared && _isFiltered) || (!onlyShared && _isFiltered)))

      return (onlyShared && recipe.shared && _isFiltered) || (!onlyShared && _isFiltered)
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
          console.debug('food ', food)
          if(food?._id) ingredients.push(food)
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

      let _id = 'search-in-shared'
      let options = this.makeRequestOptions(_id,{ message: 'Search recipes abort.' })

      let promiseSearch = undefined
      if(this.triggerSearch) promiseSearch = this.triggerSearch(filters, options)
      else promiseSearch = this.$store.dispatch('recipes/search-in-shared', {filters, options})

      promiseSearch
         .then(({data}) => {
            console.log('# Found Recipes = ', data.total)
            this.docs = data.items
            this.total = data.total
            if(!this.searchingMode) this.searchingMode = true

            this.$emit('searching', data)
            return true
         })
         .catch(err => this.handleRequestErrors.recipes.getRecipe(err, { _forbiddenPage: typeof this.triggerSearch !== 'undefined' }))
         .then(processEnd => this.processingSearch = !processEnd)
         .then(() => this.pendingRequests.remove(_id))
         .then(() => this._goToResults() )
    },

    _goToResults() {
      let navigationBar = document.querySelector('.navbar')
      let element = document.getElementById('searching-result')
      if(element)
        window.scrollTo({
          behavior: 'smooth',
          top: element.getBoundingClientRect().top - (navigationBar?.clientHeight || 0),
        })
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

    _addNumberRecipePerCountry(countryVal){
      console.warn('COUNTRY NEW ', countryVal)
      let country = this.getCountryByValue(countryVal)
      if(country) {
        let index = this.countries.findIndex(i => i.value === countryVal)
        if(index === -1) this.countries.push({...country, ...{ recipes: 1 }})
        else this.countries[index].recipes+=1
      }
    },
    _removeNumberRecipePerCountry(countryVal){
      let country = this.getCountryByValue(countryVal)
      if(country) {
        let index = this.countries.findIndex(i => i.value === countryVal)
        if(index !== -1){
          if((this.countries[index].recipe - 1) === 0) this.countries.splice(index, 1)
          else this.countries[index].recipes-=1
        }
      }
    },

    onNewRecipeListeners(_, recipe){
      if(this.isFiltered(recipe, true)){
        this.docs.unshift(recipe)
        this.total+=1
        this._addNumberRecipePerCountry(recipe.country)
      }
    },
    onUpdatedRecipeListeners(_, recipe){
      let oldRecipe = replaceIfPresent(this.docs, rec => rec._id === recipe._id, recipe)
      if(oldRecipe && oldRecipe.country !== recipe.country){
        this._removeNumberRecipePerCountry(oldRecipe.country)
        this._addNumberRecipePerCountry(recipe.country)
      }
    },
    onDeletedRecipeListeners(_, recipeID){
      let deletedRecipe = removeIfPresent(this.docs, rec => rec._id === recipeID)
      if(deletedRecipe) {
        this.total-=1
        this._removeNumberRecipePerCountry(deletedRecipe.country)
      }
    },
    onUpdateUserInfos(userInfo){
      if(userInfo && (userInfo.information || userInfo.userID))
        this.docs.filter(recipe => recipe.owner?._id === userInfo._id).forEach(recipe => this._updateUserInformation(recipe.owner, userInfo))
    },
    onDeleteUser(id){
      console.debug('on delete user => _id = ', id)
      this.docs.filter(recipe => recipe.owner?._id === id).forEach(recipe => recipe.owner = null)
    }
  },
  created() {
    this.$data._showAllFilters = this.withAllFiltersVisible

    if(this.withHistory) {
      window.onpopstate = function (e) {
        this._setFiltersFromRoute()
      }.bind(this)
    }

    if(!this.triggerSearch) this.getNumberRecipesForCountry()
    else {
      this.countries = this.$store.getters.countries
      this.loading = false
    }

    if(this.showResults) {
      this.$bus.$on('recipe:create', this.onNewRecipeListeners.bind(this))
      this.$bus.$on('recipe:update', this.onUpdatedRecipeListeners.bind(this))
      this.$bus.$on('recipe:delete', this.onDeletedRecipeListeners.bind(this))

      this.$bus.$on('user:update:info', this.onUpdateUserInfos.bind(this))
      this.$bus.$on('user:delete', this.onDeleteUser.bind(this))
    }
  },
  beforeDestroy() {
    if(this.showResults) {
      this.$bus.$off('recipe:create', this.onNewRecipeListeners.bind(this))
      this.$bus.$off('recipe:update', this.onUpdatedRecipeListeners.bind(this))
      this.$bus.$off('recipe:delete', this.onDeletedRecipeListeners.bind(this))

      this.$bus.$off('user:update:info', this.onUpdateUserInfos.bind(this))
      this.$bus.$off('user:delete', this.onDeleteUser.bind(this))
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

    & .recipe-found-container {
      & a {
        display: block;
        height: 150px;
      }

      & .recipe-found-details-container {
        position: absolute;
        right: 20px;
        bottom: 5px;
      }

      & .recipe-found{
        height: 100%;

        & div.card-body {
          padding: 1.25rem 0 ;
          color: white;
          & img {
           height: 100%;
          }
          & .container-fluid {
            position: absolute;
            top: 10px;
            & .base-info{
              background: $overlay;
            }
          }

        }
      }
    }
  }
}


</style>
