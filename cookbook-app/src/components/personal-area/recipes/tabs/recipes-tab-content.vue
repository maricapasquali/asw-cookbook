<template>
  <div>
    <b-container fluid>
      <h2> {{title}}</h2>
    </b-container>

    <!-- DIRECT SHARE A SAVED RECIPE -->
    <b-modal centered v-model="directShared" title="Condividi ricetta salvata" ok-only @ok="shareRecipe" @hidden="_resetSelectedItem">
      <p> Vuoi davvero condividere la ricetta <b><em>{{selectedItem.recipe.name}}</em></b> senza modificarla ?</p>
    </b-modal>

    <!-- DIRECT SAVED A SHARED RECIPE -->
    <b-modal centered v-model="directSaved" title="Salva come nuove ricetta" ok-only @ok="saveRecipe" @hidden="_resetSelectedItem">
      <p> Vuoi davvero fare un duplicato privato della ricetta <b><em>{{selectedItem.recipe.name}}</em></b> senza modificarla ?</p>
    </b-modal>

    <!-- DELETE OR REMOVE RECIPE -->
    <b-modal centered v-model="deleteRecipe" ok-only @ok="eraseRecipe" @hidden="_resetSelectedItem">
      <template #modal-title>
        <p v-if="isLovedTab">Rimuovi ricetta</p>
        <p v-else>Cancella ricetta</p>
      </template>
      <p v-if="isLovedTab">Vuoi davvero rimuovere dai preferiti la ricetta <b><em>{{selectedItem.recipe.name}}</em></b>?</p>
      <p v-else> Vuoi davvero cancellare la ricetta <b><em>{{selectedItem.recipe.name}}</em></b>?</p>
    </b-modal>


    <!-- SEARCHES -->
    <b-container fluid class="search-section" v-if="$data._recipes.length || searching.on">
      <search-recipes ref="searcher" @reset="stopSearch" @searching="onSearching" :trigger-search="search" :with-history=false :with-all-filters-visible=false :show-results=false />
    </b-container>

    <b-skeleton-wrapper :loading="processing.first">
      <template #loading>
        <b-list-group>
          <b-list-group-item v-for="ind in skeletons" :key="ind" >
            <b-row class="ml-2" cols="1" cols-md="2">
              <b-col class="mb-2">
                <b-row>
                  <b-col class="text-center px-0" align-self="center" cols="3" >
                    <b-skeleton-img />
                  </b-col>
                  <b-col class="ml-3">
                    <b-row> <b-skeleton width="50%"></b-skeleton> </b-row>
                    <b-row> <b-skeleton width="20%"></b-skeleton> </b-row>
                    <b-row> <b-skeleton width="10%"></b-skeleton> </b-row>
                  </b-col>
                </b-row>
              </b-col>
              <b-col class="text-right mb-2">
                <b-button-group>
                  <b-skeleton type="button"></b-skeleton>
                  <b-skeleton type="button"></b-skeleton>
                  <b-skeleton type="button"></b-skeleton>
                </b-button-group>
              </b-col>
            </b-row>
          </b-list-group-item>
        </b-list-group>
      </template>

      <!-- TABS OF RECIPES -->
      <b-container fluid class="recipes-section" >
        <b-row v-show="!searching.on">
          <b-col>
            <b-row cols="1">
              <b-col class="text-right" v-if="$data._total">
                <strong> Mostra <span>{{$data._recipes.length}}</span> ricette di <span>{{$data._total}}</span>  </strong>
              </b-col>
              <b-col>
                <b-list-group>
                  <b-list-group-item  v-for="(item, index) in $data._recipes" :key="item.recipe._id">
                    <recipe-tab-item
                        :selectedType="selectedType"
                        :position="index"
                        :item="item"
                        @onChangedRecipe="onChangedRecipe"
                        @onClickErase="showErase"
                        @onClickDirectlySaved="showDirectlySaved"
                        @onClickDirectlyShared="showDirectlyShared"
                    />
                  </b-list-group-item>
                  <div v-if="!$data._recipes.length"> Nessuna ricetta trovata. </div>
                </b-list-group>
              </b-col>
            </b-row>
            <b-row>
              <load-others :are-others="areOthers" :in-processing="processing.other" :trigger-others="others"/>
            </b-row>
          </b-col>
        </b-row>
        <!--- Search view --->
        <b-row id="searching-result" v-if="searching.on">
          <b-col>
            <strong> Risultati: </strong>
            <b-list-group>
              <b-list-group-item v-for="(item, index) in searching.result" :key="item.recipe._id">
                <recipe-tab-item
                    mode="search-mode"
                    :selectedType="selectedType"
                    :position="index"
                    :item="item"
                    @onChangedRecipe="onChangedRecipe"
                    @onClickErase="showErase"
                    @onClickDirectlySaved="showDirectlySaved"
                    @onClickDirectlyShared="showDirectlyShared"
                />
              </b-list-group-item>
              <div v-if="!searching.result.length"> Nessuna ricetta trovata. </div>
            </b-list-group>
          </b-col>
        </b-row>
      </b-container>
    </b-skeleton-wrapper>
  </div>
</template>

<script>
import Vue from "vue";
import {mapGetters} from "vuex";
import RecipeForm from '../recipe-form';

import BusListener from "./bus-listeners.mixin"

export default {
  name: "recipes-tab-content",
  mixins: [BusListener],
  props: {
    isActive: Boolean,
    selectedType: String,
    recipes: Array,
    total: Number,
    paginationOptions: {
      limit: Number,
      page: Number,
      skip: Number
    },

    processing: {
      first: Boolean,
      other: Boolean
    }
  },
  data() {
    return {
      skeletons: 6,

      _recipes: [],
      _total: 0,
      _paginationOptions: {
        limit: 0,
        page: 0,
        skip: 0
      },

      numberDeleted: 0,
      numberAdded: 0,

      _processing: {},

      searching: {
        on: false,
        result: []
      },

      directShared: false,
      directSaved: false,
      deleteRecipe: false,
      selectedItem: {
        recipe: {},
        position: -1
      }
    }
  },
  computed: {
    ...mapGetters({
      userIdentifier: 'session/userIdentifier',
    }),

    isLovedTab(){
      return this.selectedType === 'loved'
    },
    isSharedTab(){
      return this.selectedType === 'shared'
    },
    isSavedTab(){
      return this.selectedType === 'saved'
    },
    areOthers() {
      return this.$data._recipes.length > 0 && this.$data._recipes.length < this.$data._total
    },
    title(){
      switch (this.selectedType){
        case "shared":
          return "Ricette condivise"
        case "saved":
          return "Ricette salvate"
        case "loved":
          return "Ricette piaciute"
        case "shared-in-chat":
          return "Ricette condivise in chat"
        default:
          return ""
      }
    }
  },
  watch: {
    isActive(val){
      console.debug(`Tab content '${this.selectedType}' ${val? "show": "hide"}`)
      if(!val) this.changing()
      else {
        console.debug('recipes new val : ', this.recipes)
        console.debug('recipes old val : ', this.$data._recipes)
        this.numberDeleted = this.$data._recipes.length > this.recipes.length && this.$data._recipes.length - this.recipes.length
        let nAdded = this.$data._recipes.length < this.recipes.length && this.recipes.length - this.$data._recipes.length
        this.setView()
        if(this.numberDeleted) this.$data._total -= this.numberDeleted
        if(nAdded) {
          this.$data._total += nAdded
          this.$data._paginationOptions.skip += nAdded
        }

        console.debug('# deleted recipe: ', this.numberDeleted, ' # added recipes: ',  nAdded)
        console.debug('new total  ',  this.$data._total, ', new PaginationOptions  ', this.$data._paginationOptions)
      }
    },
    recipes(val) {
      console.debug('recipes watch')
      this.setRecipes(val)
    },
    total(val) {
      console.debug('total watch : ', val)
      this.setTotal(val)
    },
    paginationOptions(val) {
      console.debug('paginationOptions watch : ', val)
      this.setPaginationOptions(val)
    },
    processing(val) {
      console.debug('processing watch : ', val)
      this.setProcessing(val)
    }
  },
  created() {
    console.debug('Create tab ', this.selectedType)
    this.setView()
  },
  beforeDestroy() {
    console.debug('Destroy tab ', this.selectedType)
  },
  methods: {

    setView(){
      this.stopSearch()
      this.setRecipes(this.recipes)

      this.setTotal(this.total)
      this.setPaginationOptions(this.paginationOptions)

      this.setProcessing(this.processing)
    },

    setRecipes(val) {
      if (Array.isArray(val)) {
        let _diff = diff(val, this.$data._recipes.map(i => i.recipe)).map(recipe => this._remapping(recipe))
        if(_diff.length){
          let itemLastOfDiff = lastOf(_diff)
          let firstItem = this.$data._recipes[0]
          if(firstItem && itemLastOfDiff.recipe.updatedAt > firstItem.recipe.updatedAt) this.$data._recipes.unshift(... _diff)
          else this.$data._recipes.push(..._diff)
        }
      }
    },
    setTotal(val) {
      this.$data._total = val
    },
    setPaginationOptions(val) {
      this.$data._paginationOptions = val
    },
    setProcessing(val) {
      this.$data._processing = val
    },

    others() {
      if (this.numberDeleted) {
        this.$emit('others', 1, this.$data._paginationOptions.limit, this.$data._recipes.length)
        this.$data._paginationOptions.skip += this.numberDeleted
        this.numberDeleted = 0
      } else {
        this.$data._paginationOptions.page += 1
        this.$emit('others', this.$data._paginationOptions.page)
      }
    },

    changing() {
      this.$emit('onChangingRecipes', {
        recipes: this.$data._recipes.map(i => i.recipe),
        total: this.$data._total,
        paginationOptions: this.$data._paginationOptions,
      })
    },


    /* --- OPERATION on array recipes --- */

    _prependRecipe(cRecipe) {
      let inserted = prependIfAbsent(this.$data._recipes, this._remapping(cRecipe), item => item.recipe._id === cRecipe._id)
      if (inserted) {
        this.numberAdded += 1
        this.$data._paginationOptions.skip = this.numberAdded
        this.$data._total += 1
        this.changing()
      }
    },
    _prependRecipeInSearchMode(recipe){
      if(this.searching.on && this.isFilteredOnSearchMode(recipe))
       prependIfAbsent(this.searching.result, this._remapping(recipe))
    },

    __updateRecipe(array, newRecipe, position){
      let _position = position
      if(!position || position < 0){
        _position = array.findIndex(i => i.recipe._id === newRecipe._id)
      }
      if(_position >= 0) {
        Object.assign(array[_position], {recipe: newRecipe})
        prepend(array, _position)
      }
    },

    _updateRecipe(newRecipe, position){
      this.__updateRecipe(this.$data._recipes, newRecipe, position)
    },

    _updateRecipeInSearchMode(newRecipe){
      if(this.searching.on) this.__updateRecipe(this.searching.result, newRecipe)
    },

    _removeRecipeOnIndex(position){
      if(position >= 0){
        let deletedItems = this.$data._recipes.splice(position, 1)
        if (deletedItems.length) {
          this.numberDeleted += 1
          this.$data._total -= 1
          this.changing()
        }
      }
    },
    _removeRecipe(recipeID){
      let index = this.$data._recipes.findIndex(item => item.recipe._id === recipeID)
      if(index !== -1) this._removeRecipeOnIndex(index)
    },
    _removeRecipeInSearchMode(recipeID){
      if(this.searching.on) removeIfPresent(this.searching.result, item => item.recipe._id === recipeID)
    },
    /* ----------------------------------- */

    /* --- DOCUMENT REMAPPING --- */
    _remapping(recipe, _showDetails = false) {
      let operation = []
      switch (this.selectedType){
        case "shared":
          operation.push('details')
          operation.push('change')
          operation.push('directly-saved')
          operation.push('delete')
          break
        case "saved":
          operation.push('details')
          operation.push('change')
          operation.push('directly-shared')
          operation.push('delete')
          break
        case "loved":
          operation.push('details')
          operation.push('remove')
          break
        case "shared-in-chat":
          operation.push('details')
          break
        default:
          return { actions:[], recipe: {}, _showDetails: false }
      }
      return {recipe: recipe, actions: operation, showDetails: _showDetails}
    },

    /*--- OPERATION ---*/

    /* ---- SEARCH ---- */
    search(filters, options) {
      return this.$store.dispatch('recipes/search-in-all', {filters, type: this.selectedType, options})
    },
    onSearching(data) {
      console.debug('SEARCHING Recipes Shared are ' + data.total)
      //RENDER RESULT OF SEARCH
      this.setDefaultValueOn(data.items)
      this.searching = {
        on: true,
        result: data.items.map(recipe => this._remapping(recipe))
      }
    },
    stopSearch() {
      console.debug('STOP SEARCHING')
      this.searching = {
        on: false,
        result: []
      }
    },
    isFilteredOnSearchMode(recipe){
      return this.$refs.searcher.isFiltered(recipe, false)
    },
    /*------------------------------------------*/



    /* - CHANGE */
    _updateOnly(position, cRecipe){
      let _position = this.searching.on ? -1 : position
      if(this.searching.on){
        console.log('Only update ...')
        if (this.isFilteredOnSearchMode(cRecipe)) {
          Object.assign(this.searching.result[position], {recipe: cRecipe})
          prepend(this.searching.result, position)
        }
        _position = this.$data._recipes.findIndex(i => i.recipe._id === cRecipe._id)
      }

      if (_position >= 0) {
        Object.assign(this.$data._recipes[_position], {recipe: cRecipe})
        prepend(this.$data._recipes, _position)
        this.changing()
      }
    },

    _onChangedRecipeOfShared(cRecipe, position){
      let old = this.searching.on ? this.searching.result[position]?.recipe : this.recipes[position]
      console.debug((this.searching.on ? 'Search' : 'Retrieve') + ' mode: old recipe => ', old)
      console.debug((this.searching.on ? 'Search' : 'Retrieve') + ' mode: cRecipe recipe => ', cRecipe)
      //tab shared
      // new saved
      // update
      // new shared

      if (cRecipe._id !== old._id && cRecipe.shared === false) { // when click 're-saved' //ok
        console.log('Save a private copy of shared recipe ...')
        this.$emit('onClickReSaved', cRecipe)
      }

      if (cRecipe._id === old._id && cRecipe.shared === old.shared) // when click 'saved' //ok
        this._updateOnly(position, cRecipe)

      if (cRecipe._id !== old._id && cRecipe.shared === true) { // when click 're-shared' //ok
        this._prependRecipe(cRecipe)
        this._prependRecipeInSearchMode(cRecipe)
      }
    },

    _onChangedRecipeOfSaved(cRecipe, position){
      let old = this.searching.on ? this.searching.result[position]?.recipe : this.recipes[position]
      console.debug((this.searching.on ? 'Search' : 'Retrieve') + ' mode: old recipe => ', old)
      //tab saved
      // update
      // remove from saved recipe, and add shared recipe

      if(old.shared === cRecipe.shared) {  // when click 'save' //ok
        this._updateOnly(position, cRecipe)
      }
      else { // when click 'shared' //ok
        let _position = this.searching.on ? -1: position
        if(this.searching.on){
          let deletedItemSearch = this.searching.result.splice(position, 1).pop()
          if(deletedItemSearch) _position = this.$data._recipes.findIndex(i => i.recipe._id === deletedItemSearch.recipe._id)
        }
        if(_position >= 0){
          this._removeRecipeOnIndex(_position)
          this.$emit("onClickShared", cRecipe)
        }
      }
    },

    onChangedRecipe(cRecipe, position) {
      switch (this.selectedType){
        case "shared":
          this._onChangedRecipeOfShared(cRecipe, position)
          break
        case "saved":
          this._onChangedRecipeOfSaved(cRecipe, position)
          break
      }
    },

    /* Modal OPERATION */
    _resetSelectedItem(){
      this.selectedItem = {
        recipe: {},
        position: -1
      }
    },

    /* - SAVED RECIPE: SHARE ONLY */
    showDirectlyShared(recipe, position){
      this.directShared = true
      this.selectedItem = {recipe, position}
    },
    shareRecipe(){
      const CRecipeForm = Vue.extend(RecipeForm)
      const instance = new CRecipeForm({store: this.$store, propsData: { value: this.selectedItem.recipe }})
      instance.$on('onChanged', this.onDirectlySharedOfSaved.bind(this))
      instance.shared()
    },
    onDirectlySharedOfSaved(cRecipe) {
      this._onChangedRecipeOfSaved(cRecipe, this.selectedItem.position)
    },

    /* - SHARED RECIPE: SAVE ONLY */
    showDirectlySaved(recipe, position){
      this.directSaved = true
      this.selectedItem = {recipe, position}
    },
    saveRecipe(){
      const CRecipeForm = Vue.extend(RecipeForm)
      const instance = new CRecipeForm({store: this.$store, propsData: { value:  this.selectedItem.recipe }})
      instance.$on('onChanged', this.onDirectlySavedOfShared.bind(this))
      instance.saved()
    },
    onDirectlySavedOfShared(cRecipe) {
      this.$emit('onClickReSaved', cRecipe)
    },

    /* - DELETE OR REMOVE */
    showErase(recipe, position){
      this.deleteRecipe = true
      this.selectedItem = {recipe, position}
    },
    eraseRecipe(){
      let recipe = this.selectedItem.recipe
      console.debug(recipe)
      if(this.isLovedTab) {
        console.log('REMOVE LIKE ON RECIPE')
        let like = recipe.likes.find(l => l.user && l.user._id === this.userIdentifier)
        console.debug(like)
        this.$store.dispatch('likes/remove', {ownerID: recipe.owner._id, recipeID:  recipe._id, likeID: like._id})
            .then(({data}) => {
              console.debug(data)

              this.afterErase(this.selectedItem.position)

              this.$socket.emit('unlike:recipe', recipe._id, like._id)
            })
            .catch(this.$store.$api.errorsHandler.likes.makeOrUnmakeLike)
      } else {
        console.log('DELETE RECIPE')
        this.$store.dispatch('recipes/remove', recipe._id)
            .then(({data}) => {
              console.debug(data)

              this.afterErase(this.selectedItem.position)

              this.$socket.emit('recipe:delete', recipe)
            })
            .catch(this.$store.$api.errorsHandler.recipes.deleteRecipe)
      }
    },
    afterErase(position) {
      let _position = this.searching.on ? -1 : position
      if (this.searching.on) {
        let deletedItemSearch = this.searching.result.splice(position, 1).pop()
        if (deletedItemSearch) _position = this.$data._recipes.findIndex(i => i.recipe._id === deletedItemSearch.recipe._id)
      }
      if (_position >= 0) this._removeRecipeOnIndex(_position)
    },
  }
}
</script>

<style scoped>
</style>