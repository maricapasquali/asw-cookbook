<template>
  <b-tabs card :vertical="!isMobileDevice" :pills="!isMobileDevice" v-resize="onResize">
    <b-tab v-for="tab in tabs" :key="tab.type" :title="tab.title" :active="active === tab.type" @click="select(tab.type)"  lazy>
      <!-- UPDATE RECIPE -->
      <div ref="update-recipe" v-if="formUpdate.show">
        <b-row >
          <b-col class="text-right">
            <b-button id="btn-add-recipes" class="mr-3" variant="danger" pill @click="formUpdate.show = false" >
              <font-awesome-icon icon="times-circle"  class="icon" />
            </b-button>
            <b-tooltip target="btn-add-recipes">Chiudi modifica</b-tooltip>
          </b-col>
        </b-row>
        <b-row>
          <b-col>
            <recipe-form title="Modifica ricetta" v-model="itemsRecipes[formUpdate.index].recipe" @onChanged="onChangedRecipe"/>
          </b-col>
        </b-row>
      </div>
      <!-- DIRECT SHARE A SAVED RECIPE -->
      <b-modal centered v-model="directShared.show" title="Condividi ricetta salvata" ok-only @ok="shareRecipe">
        <p> Vuoi davvero condividere la ricetta <b><em>{{directShared.name}}</em></b> senza modificarla ?</p>
      </b-modal>
      <!-- ERASE RECIPE -->
      <b-modal centered v-model="deleteRecipe.show" ok-only @ok="eraseRecipe">
        <template #modal-title>
          <p v-if="deleteRecipe.removeFromLoved">Rimuovi ricetta</p>
          <p v-else>Cancella ricetta</p>
        </template>
        <p v-if="deleteRecipe.removeFromLoved">Vuoi davvero rimuovere dai preferiti la ricetta <b><em>{{deleteRecipe.name}}</em></b>?</p>
        <p v-else> Vuoi davvero cancellare la ricetta <b><em>{{deleteRecipe.name}}</em></b>?</p>
      </b-modal>
      <!-- SEARCHES -->
      <b-container fluid class="search-section" v-if="itemsRecipes.length" v-show="!formUpdate.show">
        <search-recipes @reset="stopSearch" @searching="onSearching" :trigger-search="search" :with-history=false :with-all-filters-visible=false :show-results=false />
      </b-container>

      <b-skeleton-wrapper :loading="processing">
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
        <b-container fluid class="recipes-section" v-show="!formUpdate.show" >
          <strong v-if="searching.on"> Risultati: </strong>
          <b-list-group>
            <b-list-group-item v-for="(item, index) in itemsRecipes" :key="item.id" >
              <b-row class="ml-2" cols="1" cols-md="2">
                <b-col class="mb-2">
                  <b-row>
                    <preview-recipe-image class="col col-3 px-0" v-model="item.recipe.img" />
                    <b-col class="ml-3">
                      <b-row>
                        <strong>
                          <router-link v-if="isLoved && item.recipe.owner"  :to="{name: 'single-recipe', params: {id: item.recipe.owner._id, recipe_id: item.recipe._id } }">{{item.recipe.name}}</router-link>
                          <span v-else> {{item.recipe.name}} </span>
                        </strong>
                      </b-row>
                      <b-row v-if="item.recipe.owner"><router-link :to="{name: 'single-user', params:{id: item.recipe.owner._id}}">{{item.recipe.owner.userID}}</router-link></b-row>
                      <b-row><small>{{ item.recipe.createdAt | dateFormat }}</small></b-row>
                      <b-row class="mt-1"  v-if="item.recipe.shared && item.recipe.likes.length > 0">
                        <b-col class="pl-0"><b-icon-heart-fill /> <span>{{item.recipe.likes.length}}</span></b-col>
                      </b-row>
                    </b-col>
                  </b-row>
                </b-col>
                <b-col class="text-right mb-2" >
                  <b-button-group>
                    <b-button :id="item.recipe._id+'-details'" v-if="item.actions.includes('details')" variant="info" @click="item.showDetails = !item.showDetails"> <b-icon-info-circle/> </b-button>
                    <b-button :id="item.recipe._id+'-edit'"  v-if="item.actions.includes('change')" variant="primary" @click="onModify(index)"> <b-icon-pencil-square /> </b-button>
                    <b-button :id="item.recipe._id+'-directly-shared'"  v-if="item.actions.includes('directly-shared')" variant="light" @click="onDirectlyShared(index)"> <b-icon-share /> </b-button>
                    <b-button :id="item.recipe._id+'-delete'" v-if="item.actions.includes('delete')" variant="danger" @click="onErase(index)"> <b-icon-trash-fill /> </b-button>
                    <b-button :id="item.recipe._id+'-remove'" v-if="item.actions.includes('remove')" variant="danger" @click="onErase(index, true)"> <b-icon-trash-fill/> </b-button>
                  </b-button-group>
                  <b-tooltip :target="item.recipe._id+'-details'" v-if="item.actions.includes('details')" >{{ item.showDetails ? 'Nascondi' : 'Mostra' }} Dettagli</b-tooltip>
                  <b-tooltip :target="item.recipe._id+'-edit'" v-if="item.actions.includes('change')" >Modifica</b-tooltip>
                  <b-tooltip :target="item.recipe._id+'-directly-shared'" v-if="item.actions.includes('directly-shared')" >Condividi senza modificare</b-tooltip>
                  <b-tooltip :target="item.recipe._id+'-delete'" v-if="item.actions.includes('delete')" >Cancella</b-tooltip>
                  <b-tooltip :target="item.recipe._id+'-remove'" v-if="item.actions.includes('remove')" >Rimuovi</b-tooltip>
                </b-col>
              </b-row>
              <!-- Details -->
              <b-card class="mt-3" v-show="item.showDetails">
                <!-- Tutorial -->
                <b-row class="tutorial mb-4" align-h="center" v-if="item.recipe.tutorial">
                  <preview-recipe-tutorial class="col col-6" v-model="item.recipe.tutorial" :poster="item.recipe.img" @onVideoNotFound="tutorialNotFound" />
                </b-row>

                <!-- Country, Diet & Category -->
                <b-row class="country-diet-category" cols="1" cols-sm="3">
                  <b-col v-if="item.recipe.diet && item.recipe.diet.value">
                    <b-form-group label-for="r-d-diet" label="Regime alimentare">
                      <b-form-input id="r-d-diet" :value="item.recipe.diet.text" readonly/>
                    </b-form-group>
                  </b-col>
                  <b-col>
                    <b-form-group label-for="r-d-category" label="Categoria">
                      <b-form-input id="r-d-category" :value="item.recipe.category.text" readonly/>
                    </b-form-group>
                  </b-col>
                  <b-col v-if="item.recipe.country" align-self="center" class="text-right">
                    <country-image v-model="item.recipe.country" width="50" height="50" :id="index" />
                  </b-col>
                </b-row>

                <!-- Ingredients  & Table of Nutrients -->
                <b-row class="ingredients-nutrients" cols="1" cols-lg="2">
                  <b-col>
                    <b-form-group label="Ingredienti" :label-for="'recipe-'+ item.recipe._id + '-ingredients'">
                      <ingredient-list :id="'recipe-'+item.recipe._id + '-ingredients'" v-model="item.recipe.ingredients"/>
                    </b-form-group>
                  </b-col>
                  <b-col>
                    <nutrients-table :ingredients="item.recipe.ingredients"/>
                  </b-col>
                </b-row>
                <!-- Preparation & Notes -->
                <b-row class="preparation-notes" cols="1" :cols-lg="item.recipe.note? 2: 1">
                  <b-col>
                    <b-form-group label-for="r-d-preparation" label="Preparazione">
                      <b-form-textarea id="r-d-preparation" readonly :value="item.recipe.preparation" rows="10" no-resize/>
                    </b-form-group>
                  </b-col>
                  <b-col v-if="item.recipe.note">
                    <b-form-group label-for="r-d-notes" label="Note">
                      <b-form-textarea id="r-d-notes" readonly :value="item.recipe.note" rows="10" no-resize />
                    </b-form-group>
                  </b-col>
                </b-row>

                <b-row v-if="item.recipe.shared && item.recipe.likes.length>0">
                  <b-col> <!-- TODO: migliorare css on list of liker -->
                    <strong>Chi ha messo 'Mi piace'</strong>
                    <liker-list v-model="item.recipe.likes"/>
                  </b-col>
                </b-row>
                <!-- Comments -->
                <b-row cols="1" class="comments mx-1" v-if="item.recipe.shared && item.recipe.comments.length>0">
                 <b-col class="px-0"><strong>Commenti</strong></b-col>
                 <b-col> <comments v-model="item.recipe.comments" :recipe="item.recipe" /></b-col>
                </b-row>

              </b-card>
            </b-list-group-item>
            <div v-if="!itemsRecipes.length"> Nessuna ricetta trovata. </div>
          </b-list-group>
          <b-row v-if="areOthers">
            <b-col class="text-center">
              <b-button variant="link" @click="others"> carica altre ... </b-button>
            </b-col>
          </b-row>
        </b-container>
      </b-skeleton-wrapper>
    </b-tab>

    <b-tab title="Inserisci ricetta" @click="select('add')" :active="isAddRecipeTab" lazy>
      <recipe-form @onShared="onShareRecipe" @onSaved="onSaveRecipe"/>
    </b-tab>
  </b-tabs>
</template>

<script>

import {dateFormat} from "~/utils";

import api from '@api'
import {mapGetters} from "vuex";

import Vue from "vue";
import RecipeForm from './recipe-form';

export default {
  name: "recipe-sections",
  data(){
    return {
      skeletons: 7,

      deleteRecipe :{
        show: false,
        index: -1,
        name: '',
        removeFromLoved: false
      },
      formUpdate: {
        show: false,
        index: -1
      },
      directShared: {
        show: false,
        index: -1,
        name: ''
      },

      searching: {
        on: false,
        result: [],
        backupItems: []
      },

      tabs: [
        {
          title: 'Condivise',
          type: 'shared',
          itemsRecipes: []
        },
        {
          title: 'Salvate',
          type: 'saved',
          itemsRecipes: []
        },
        {
          title: 'Preferite',
          type: 'loved',
          itemsRecipes: []
        },
        {
          title: 'Condivise in chat', //TODO: da rigurdare quando creato 'chats'
          type: 'shared-in-chat',
          itemsRecipes: []
        }
      ],
      isMobileDevice: false,

      processing: true,
      total: 0,
      paginationOptions: {
        page: 1,
        limit: 2 //todo: change pagination limit  from 2 to 10
      }
    }
  },

  computed:{
    ...mapGetters([
      'accessToken',
      'userIdentifier',
      'socket'
    ]),

    itemsRecipes: {
      get(){
        if(this.searching.on){
          return this.searching.result
        }else {
          let items = this.tabs.find(e => e.type === this.active)
          return items ? items.itemsRecipes : []
        }
      },
      set(val){
        if(this.searching.on) this.searching.result = []
        if(Array.isArray(val)) this.itemsRecipes.push(...val)
        else this.itemsRecipes.push(val)
      }
    },

    active(){
      return this.$route.query.tab
    },
    areOthers(){
      return !this.searching.on && this.itemsRecipes.length >0 && this.itemsRecipes.length < this.total
    },
    isLoved(){
      return this.active === 'loved'
    },
    isAddRecipeTab(){
      return this.active === 'add'
    },
    likes(){
      return this.itemsRecipes.map(item => item.recipe.likes)
    }
  },
  filters: {
    dateFormat: dateFormat,
  },
  methods:{
    tutorialNotFound(e){
      console.error('tutorial ('+e.target.src+') not found')
      e.target.parentNode.parentNode.remove()
    },

    onResize({screenWidth}){
      // console.debug('on resize ...')
      this.isMobileDevice = screenWidth < 768
    },

    /* documentations */
    remapping(recipe, _showDetails = false, tab){
      let operation = []
      switch (tab || this.active){
        case 'saved':
          operation.push('details')
          operation.push('change')
          operation.push('directly-shared')
          operation.push('delete')
          break
        case 'shared':
          operation.push('details')
          operation.push('change')
          operation.push('delete')
          break
        case 'loved':
          operation.push(recipe.owner ? 'remove' : 'details')
          break
        case 'shared-in-chat':
          operation.push('details')
          //in the FUTURE: operation.push('change'); operation.push('delete')
          break
      }
      return {recipe: recipe, actions: operation, showDetails: _showDetails}
    },
    getDocs(currentPage, _limit){
      // this.paginationOptions.page = currentPage || 1
      const page = currentPage || 1
      const limit = _limit || this.paginationOptions.limit
      console.debug('Pagination = ', {page, limit})

      api.recipes
         .getRecipes(this.userIdentifier, this.accessToken, this.active, {page, limit})
         .then(({data}) => {
            console.log(data)
            this.setDefaultValueOn(data.items)

            let _remapData = data.items.map(r => this.remapping(r))
            if(currentPage) this.itemsRecipes.push(..._remapData)
            else this.itemsRecipes = _remapData

            this.total = data.total
            if(!_limit) this.paginationOptions.page = page
            return true
         })
         .catch(err => this.handleRequestErrors.recipes.getRecipe(err, {_forbiddenPage: true}))
         .then(processEnd => this.processing = !processEnd)

    },
    others(){
      console.debug('Others ..')
      this.getDocs(this.paginationOptions.page + 1)
    },

    setDefaultValueOn(docs){
      const setting = (recipe) => {

        let category = RecipeCategories.find(recipe.category)
        if(category) recipe.category = category

        let diet = Diets.find(recipe.diet)
        recipe.diet = diet || Diets.find('')

      }
      if(Array.isArray(docs)) docs.forEach(recipe => setting(recipe))
      else setting(docs)
    },

    /* search */
    search(filters){
      return api.recipes.getRecipes(this.userIdentifier,  this.accessToken, this.active, {}, filters)
    },
    onSearching(data){
      console.debug('SEARCHING Recipes '+ this.active + ' are '+data.total)
      //RENDER RESULT OF SEARCH
      this.searching.on = true
      this.setDefaultValueOn(data.items)
      this.itemsRecipes = data.items.map(r => this.remapping(r))
    },
    stopSearch(){
      console.debug('STOP SEARCHING')
      this.searching.on = false
    },

    /* ACTIONS: MODIFY, DELETE, REMOVE ...*/
    closeChangeMode(){
      this.formUpdate = {
        show: false,
        index: -1
      }
    },
    openChangeMode(index){
      this.formUpdate = {
        show: true,
        index: index
      }
    },
    /* - CHANGE */
    onModify(index){
      console.debug('onModify ...')

      this.openChangeMode(index)

      // if(!this.$route.query.mode) this.$router.push({query: {tab: this.$route.query.tab, mode: 'change'}}) //TODO: find a way to push change mode state but no in history
    },
    onChangedRecipe(cRecipe){
      console.debug('onChangedRecipe ... ')
      let old = this.itemsRecipes[this.formUpdate.index]

      switch (this.active){
        case 'shared': {
          // tab shared
            // new saved
            // update
            // new shared

            //if(cRecipe._id !== old.recipe._id && cRecipe.shared === false) // nothing

            if(cRecipe._id === old.recipe._id && cRecipe.shared === old.recipe.shared)
              this.itemsRecipes[this.formUpdate.index] = Object.assign(old, {recipe: cRecipe})

            if(cRecipe._id !== old.recipe._id && cRecipe.shared === true)
              this.itemsRecipes.unshift(this.remapping(cRecipe))
        }
        break
        case 'saved': {
          //tab saved
            // update
            // remove from this.itemsRecipes
          if(old.recipe.shared === cRecipe.shared) this.itemsRecipes[this.formUpdate.index] = Object.assign(old, {recipe: cRecipe})
          else this.itemsRecipes.splice(this.formUpdate.index, 1)
        }
        break
      }

      this.closeChangeMode()
    },

    /* - SAVED RECIPE: SHARE ONLY */
    onDirectlyShared(index){
      this.directShared = {
        show: true,
        index: index,
        name: this.itemsRecipes[index].recipe.name
      }
    },
    shareRecipe(){
      const recipe = this.itemsRecipes[this.directShared.index].recipe
      const CRecipeForm = Vue.extend(RecipeForm)
      const instance = new CRecipeForm({store: this.$store, propsData: { value: recipe }})
      instance.$on('onChanged', this._afterOnlyShared.bind(this))
      instance.shared()
    },
    _afterOnlyShared(cRecipe){
      this.itemsRecipes.splice(this.directShared.index, 1)
      let items = this.tabs.find(e => e.type === 'shared')
      if(items) items.itemsRecipes.unshift(this.remapping(cRecipe, false, 'shared'))
      this.closeDirectSharedMode()
    },
    closeDirectSharedMode(){
      this.directShared = {
        index: -1,
        name: '',
        show: false
      }
    },

    /* -DELETE OR REMOVE */
    onErase(index, removeFromLoved = false){
      this.deleteRecipe = {
        show: true,
        index: index,
        name: this.itemsRecipes[index].recipe.name,
        removeFromLoved: removeFromLoved
      }
    },
    _closeDeleteMode(){
      this.deleteRecipe = {
        index: -1,
        name: '',
        show: false,
        removeFromLoved: false
      }
    },
    eraseRecipe(){

      let recipe = this.itemsRecipes[this.deleteRecipe.index].recipe
      console.debug(recipe)
      if(this.deleteRecipe.removeFromLoved){
        console.log('REMOVE LIKE ON RECIPE')
        let like = recipe.likes.find(l => l.user && l.user._id === this.userIdentifier)
        console.debug(like)
        api.recipes
           .likes
           .unLike(recipe.owner._id, recipe._id, like._id , this.accessToken)
           .then(({data}) => {
             console.log(data)
             this.itemsRecipes.splice(this.deleteRecipe.index, 1)
           })
           .catch(this.handleRequestErrors.recipes.likes.makeOrUnmakeLike)
           .then(this._closeDeleteMode)
      }
      else
      {
        console.log('DELETE RECIPE')
        api.recipes
           .deleteRecipe(this.userIdentifier, recipe._id, this.accessToken)
           .then(({data}) => {
             console.log(data)
             this.itemsRecipes.splice(this.deleteRecipe.index, 1)
             this.$socket.emit('recipe:delete', recipe)
           })
           .catch(this.handleRequestErrors.recipes.deleteRecipe)
           .then(this._closeDeleteMode)
      }
    },
    /* END ACTIONS: MODIFY, DELETE, REMOVE ...*/


    /* TABS & WINDOW */

    select(type = this.active){
      this.closeChangeMode()

      if(this.active !== type) {
        this.$router.push({query: {tab: type}})
        console.debug('set route with type = ', type)
      }

      if(this.itemsRecipes.length === 0 && !this.isAddRecipeTab) {
     // if(!this.isAddRecipeTab) { this.itemsRecipes = []
        this.processing = true;
        this.getDocs()
      }
    },

    // ON TAB 'ADD'
    onShareRecipe(recipe){
      //AFTER ADD NEW SHARED RECIPE ON SERVER
    },
    onSaveRecipe(recipe){
      //AFTER ADD NEW SAVED RECIPE ON SERVER
    },

    /* Listeners notification */
    onUpdatedRecipeListeners(_, recipe){
      if(recipe){
        for (const tab of this.tabs){
          let index = tab.itemsRecipes.findIndex(t => t.recipe._id === recipe._id)
          if(index !== -1) tab.itemsRecipes.splice(index, 1, this.remapping(recipe))
        }
      }
    },

    onDeletedRecipeListeners(_, recipe){
      if(recipe){
        for (const tab of this.tabs){
          let index = tab.itemsRecipes.findIndex(t => t.recipe._id === recipe)
          if(index !== -1) this.getDocs(0, this.paginationOptions.page * this.paginationOptions.limit)
        }
      }
    },

    /* Listeners update */
    onUpdateInfos(userInfo) {
      if(userInfo && userInfo.userID){
        for (const tab of this.tabs){
          tab.itemsRecipes.forEach(item => {
            if(item.recipe.owner && item.recipe.owner._id === userInfo._id && item.recipe.owner.userID !== userInfo.userID)
              item.recipe.owner.userID = userInfo.userID

            item.recipe.likes.filter(like => like.user && like.user._id === userInfo._id && like.user.userID !== userInfo.userID)
                             .forEach(like => like.user.userID = userInfo.userID)
          })
        }
      }
    },

    onDeletedUserListeners(id){
      for (const tab of this.tabs){
        for(const [index, item] of tab.itemsRecipes.entries()) {
          if(item.recipe.owner && item.recipe.owner._id === id) {
            item.recipe.owner = null
            tab.itemsRecipes.splice(index, 1, this.remapping(item.recipe, item.showDetails))
          }

          item.recipe.likes.filter(like => like.user && like.user._id === id).forEach(like => like.user = null)
        }
      }
    }
  },

  created() {
    //TODO: find a way to push change mode state but no in history
    // this.$router.beforeResolve((to, from, next) =>{
    //   console.debug('from ', from.fullPath, ' ->  to ', to.fullPath);  console.debug(JSON.stringify(this.formUpdate))
    //   if(from.query.mode) this.formUpdate.show = false
    //   if(to.query.mode) {
    //     if(this.formUpdate.index===-1) {
    //       this.formUpdate.show = false
    //       return next(from.fullPath)
    //     }
    //     else this.formUpdate.show = true
    //   }
    //   next()
    // })
    let isValidTab = this.tabs.find(t => t.type === this.active) || this.isAddRecipeTab
    if(!isValidTab) this.$router.push({query: { tab: 'shared'}})

    window.onpopstate = function (e){
      if(this.formUpdate.show) this.closeChangeMode()
    }.bind(this)

    this.$bus.$on('recipe:update', this.onUpdatedRecipeListeners.bind(this))
    this.$bus.$on('recipe:delete', this.onDeletedRecipeListeners.bind(this))

    this.$bus.$on('user:update:info', this.onUpdateInfos.bind(this))
    this.$bus.$on('user:delete', this.onDeletedUserListeners.bind(this))

  },
  mounted() {
    this.select()
  },
  beforeDestroy() {
    this.$bus.$off('recipe:update', this.onUpdatedRecipeListeners.bind(this))
    this.$bus.$off('recipe:delete', this.onDeletedRecipeListeners.bind(this))

    this.$bus.$off('user:update:info', this.onUpdateInfos.bind(this))
    this.$bus.$off('user:delete', this.onDeletedUserListeners.bind(this))
  }
}
</script>

<style lang="scss" scoped>
#btn-add-recipes{
  margin: 1%;
}

.recipes-section{
  //overflow-y: auto;
  //max-height: calc(100vh - 300px);

  & > div.collapse{
    margin: 1% 0;
  }

  & > p {
    font-size: 20pt;
  }

  & .recipe {
    & >.card-body{
      position: relative;
      padding: 0;
    }

    & .recipes-image{
      position: relative;
      width: 100%;
      height: 300px;
    }

    & .country-image{
      width: 50px;
      height: 40px
    }

    & .description-recipe, .operation-recipe {
      position: absolute;
      background-color: $overlay;
      color: white;
      left: 15px;
      width: 100%;
    }

    & .description-recipe{
      top: 0;
    }
    & .operation-recipe{
      bottom: 0;
      &  button {
        color: white;
      }
    }
  }
}
</style>