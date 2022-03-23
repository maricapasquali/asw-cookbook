<template>
  <window-with-resize size="md" @in-bound="$data._vertical=$event">
    <b-tabs card :vertical="!$data._vertical" :pills="!$data._vertical" >
      <b-tab v-for="tab in tabs" :key="tab.type" :title="tab.title" :active="active === tab.type" @click="select(tab.type)">
        <recipes-tab-content
            :is-active="active === tab.type"
            :selectedType="tab.type"
            :recipes="tab.itemsRecipes"
            :total="tab.total"
            :paginationOptions="tab.paginationOptions"
            :processing="{first: processing, other: loadOther}"
            @others="others"
            @onChangingRecipes="onChangingEvent(tab, $event)"
            @onClickReSaved="onClickReSaved"
            @onClickShared="onClickShared"
            @onLikeRecipe="onLikeRecipe"
            @onUnLikeRecipe="onUnLikeRecipe"
            @onDeleteRecipe="onDeleteRecipe"
            @onUpdateRecipe="onUpdateRecipe"
            @onShareInChat="onShareInChat"
        />
      </b-tab>
      <b-tab title="Inserisci ricetta" @click="select('add')" :active="isAddRecipeTab" lazy>
        <add-recipe-tab @onShareRecipe="onShareRecipe" @onSaveRecipe="onSaveRecipe" />
      </b-tab>
    </b-tabs>
  </window-with-resize>
</template>

<script>

import {QueuePendingRequests} from "@api/request";
import RecipeMixin from "@components/mixins/recipe.mixin"
import {mapGetters} from "vuex";

export default {
  name: "recipes-section",
  mixins: [RecipeMixin],
  data(){
    return {
      _vertical: false,

      tabs: [],

      processing: true,
      loadOther: false,

      _currentTab: {}
    }
  },

  computed:{
    ...mapGetters({
      userIdentifier: "session/userIdentifier"
    }),
    active(){
      return this.$route.query.tab
    },

    isAddRecipeTab(){
      return this.active === 'add'
    },
    isSavedRecipeTab(){
      return this.active === 'saved'
    },
    isSharedRecipeTab(){
      return this.active === 'shared'
    },

    isLovedRecipeTab(){
      return this.active === 'loved'
    },
    isSharedInChatRecipeTab(){
      return this.active === 'shared-in-chat'
    },

    currentItemTab() {
      return this.tabs.find(e => e.type === this.active)
    },
    indexCurrentItemTab() {
      return this.tabs.findIndex(e => e.type === this.active)
    }
  },

  methods: {

    /* TABS & WINDOW */
    setRecipeTabs(){
      let _itemsInfo = {
        itemsRecipes: [],
        total: 0,
        paginationOptions:  {
          page: 1,
          limit: 2, //todo: change pagination limit  from 2 to 10,
          skip: 0
        }
      }
      let _recipeType = [
        {
          title: 'Condivise',
          type: 'shared',
        },
        {
          title: 'Salvate',
          type: 'saved',
        },
        {
          title: 'Preferite',
          type: 'loved',
        },
        {
          title: 'Condivise in chat',
          type: 'shared-in-chat',
        }
      ]
      this.tabs.push(..._recipeType)
      this.tabs.forEach(tab => Object.assign(tab, clone(_itemsInfo)))
      console.debug('TABS ', this.tabs)
    },

    select(type = this.active){
      console.debug('TABS ', this.tabs)

      if(this.active !== type) {
        this.$router.push({query: {tab: type}})
        console.debug('set route with type = ', type)
      }

      let items = this.tabs.find(e => e.type === this.active)
      if(items && items.total === 0) {
        this.processing = true;
        this.getDocs()
      }
    },

    /*--- RETRIEVE RECIPE FROM SERVER ---*/

    _setRecipesInTab({page, recipes, total}){
      if(this.currentItemTab.total && page) this.$set(this.currentItemTab, 'itemsRecipes', [...this.currentItemTab.itemsRecipes, ...recipes])
      else this.currentItemTab.itemsRecipes = recipes
      this.currentItemTab.total = total
      this.$set(this.tabs, this.indexCurrentItemTab, this.currentItemTab)
    },

    /* RECIPES */
    getDocs(currentPage, _limit, _skip){

      let active = (this.active || 'shared')
      let idReq = active + '-recipe'
      let options = QueuePendingRequests.makeOptions(this.pendingRequests, idReq, {message: active + ' recipe abort.'})

      const page = currentPage || 1
      const limit = _limit || this.currentItemTab.paginationOptions.limit
      const skip = _skip || this.currentItemTab.paginationOptions.skip
      console.debug('Pagination = ', {page, limit, skip})

      this.$store.dispatch('recipes/all', { pagination:  {page, limit, skip}, type: this.active, options })
          .then(({data}) => {
            console.log(data)
            this.setDefaultValueOn(data.items)

            this._setRecipesInTab({page: currentPage, recipes: data.items, total: data.total })

            console.debug('paginationOptions = ', this.currentItemTab.paginationOptions)
            console.debug('itemsRecipes = ', this.currentItemTab.itemsRecipes)
            console.debug('total = ', this.currentItemTab.total)
            return true
          })
          .catch(err => this.handleRequestErrors.recipes.getRecipe(err, {_forbiddenPage: true}))
          .then(processEnd => {
            this.processing = !processEnd
            this.loadOther = !processEnd
          })
          .then(() => this.pendingRequests.remove(idReq))

    },

    /* OTHERs  */
    others(page, limit, skip){
      console.debug('Others: paginationOptions = ', {page, limit, skip})
      this.loadOther = true
      this.getDocs( page , limit , skip )
    },
    /*-----------------------------*/

    /*--- RECIPE TAB ---*/
    onChangingEvent(tab, e){
       console.debug("On Changing event:  tab ", tab.type)
       console.debug("Old: ", { recipes: tab.itemsRecipes, total: tab.total, paginationOptions: tab.paginationOptions })
       console.debug("New: ", e)
       this.$set(tab, 'itemsRecipes' , e.recipes)
       this.$set(tab, 'total', e.total)
       this.$set(tab, 'paginationOptions', e.paginationOptions)
    },

    onClickReSaved(savedRecipe){
      this._addRecipeInTab('saved', savedRecipe)
    },
    onClickShared(sharedRecipe){
      this._addRecipeInTab('shared', sharedRecipe)
    },
    onLikeRecipe(likedRecipe){
      this._addRecipeInTab('loved', likedRecipe)
    },
    onUnLikeRecipe(recipeID, likeID){
      let recipe = this._getRecipeInTab('loved', recipeID)
      let isMyLike = recipe?.likes?.find(l => l._id === likeID && l.user?._id === this.userIdentifier)
      if(isMyLike) this._removeRecipeInTab('loved', recipeID)
    },
    onShareInChat(recipe){
      let _oldRecipe = this._getRecipeInTab('shared-in-chat', recipe._id)
      if(_oldRecipe) this._updateAndPrependRecipeInTab('shared-in-chat', recipe)
      else this._addRecipeInTab('shared-in-chat', recipe)
    },

    onDeleteRecipe(tabName, recipeID){
      this._removeRecipeInTab(tabName, recipeID)
    },
    onUpdateRecipe(tabName, recipe){
      this._updateAndPrependRecipeInTab(tabName, recipe)
    },
    /*-----------------------------*/

    /* ADD RECIPE TAB */
    onShareRecipe(recipe){
      //AFTER ADD NEW SHARED RECIPE ON SERVER
      this._addRecipeInTab('shared', recipe)
    },
    onSaveRecipe(recipe){
      //AFTER ADD NEW SAVED RECIPE ON SERVER
      this._addRecipeInTab('saved', recipe)
    },
    /*-----------------------------*/

    /* --- OPERATION ON TABs --- */
    _removeRecipeInTab(tabName, recipeId){
      let tab = this.tabs.find(tab => tab.type === tabName)
      if(tab && tab.itemsRecipes.length && tab.total) removeIfPresent(tab.itemsRecipes, recipe => recipe._id === recipeId)
    },
    _addRecipeInTab(tabName, recipe){
      let tab = this.tabs.find(tab => tab.type === tabName)
      if(tab && tab.itemsRecipes.length && tab.total) prependIfAbsent(tab.itemsRecipes, recipe)
    },
    _updateAndPrependRecipeInTab(tabName, recipe){
      let tab = this.tabs.find(tab => tab.type === tabName)
      if(tab && tab.itemsRecipes.length && tab.total) {
        let index = tab.itemsRecipes.findIndex(rec => rec._id === recipe._id)
        if(index !== -1){
          Object.assign(tab.itemsRecipes[index], recipe)
          prepend(tab.itemsRecipes, index)
        }
      }
    },
    _getRecipeInTab(tabName, recipeId){
      let tab = this.tabs.find(tab => tab.type === tabName)
      if(tab && tab.itemsRecipes.length && tab.total)  return tab.itemsRecipes.find(recipe => recipe._id === recipeId)
    },

  },

  created() {
    this.pendingRequests = QueuePendingRequests.create()
    this.setRecipeTabs()

    let isValidTab = this.tabs.find(t => t.type === this.active) || this.isAddRecipeTab
    if(!isValidTab) this.$router.replace({ query: { tab: 'shared' } })

    this.select()
  },
  beforeDestroy() {
    this.pendingRequests.cancelAll((this.active || 'shared') + ' recipes cancel.')
  }
}
</script>

<style lang="scss" scoped>
</style>
