<template>
  <b-tabs card :vertical="!isMobileDevice" :pills="!isMobileDevice">
    <b-tab v-for="tab in tabs" :key="tab.type" :title="tab.title" :active="active === tab.type" @click="select(tab.type)" lazy>
      <!-- UPDATE RECIPE -->
      <div ref="update-recipe" v-if="formUpdate.show">
        <b-row >
          <b-col align="end">
            <font-awesome-icon @click="formUpdate.show = false" size="2x" icon="times-circle" id="btn-add-recipes" class="icon" />
          </b-col>
        </b-row>
        <b-row>
          <b-col>
            <recipe-form title="Modifica ricetta" v-model="itemsRecipes[formUpdate.index].recipe" @onChanged="onChangedRecipe"/>
          </b-col>
        </b-row>
      </div>
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
      <b-container fluid class="search-section">
        <!-- TODO: SFUTTARE GLIE ELEMENTI DELLA SEZIONE SEARCH -->
      </b-container>

      <b-skeleton-wrapper :loading="loading">
        <template #loading>
          <b-list-group>
            <b-list-group-item v-for="ind in skeletons" :key="ind" >
              <b-row class="ml-2" cols="1" cols-md="2">
                <b-col class="mb-2">
                  <b-row>
                    <b-col class="px-0" align-self="center" align="center" cols="3" >
                      <b-skeleton-img />
                    </b-col>
                    <b-col class="ml-3">
                      <b-row> <b-skeleton width="50%"></b-skeleton> </b-row>
                      <b-row> <b-skeleton width="20%"></b-skeleton> </b-row>
                      <b-row> <b-skeleton width="10%"></b-skeleton> </b-row>
                    </b-col>
                  </b-row>
                </b-col>
                <b-col class="mb-2" align="end">
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
        <b-container fluid class="recipes-section" v-show="!formUpdate.show">
          <b-list-group>
            <b-list-group-item v-for="(item, index) in itemsRecipes" :key="item.id" >
              <b-row class="ml-2" cols="1" cols-md="2">
                <b-col class="mb-2">
                  <b-row>
                    <b-col class="px-0" align-self="center" align="center" v-if="item.recipe.img" cols="3" >
                      <b-img fluid :src="item.recipe.img" :alt="'image-'+item.recipe.name" />
                    </b-col>
                    <b-col class="ml-3">
                      <b-row>
                        <strong>
                          <router-link v-if="isLoved"  :to="{name: 'single-recipe', params: {id: item.recipe._id, _user: item.recipe.owner._id } }">{{item.recipe.name}}</router-link>
                          <span v-else> {{item.recipe.name}} </span>
                        </strong>
                      </b-row>
                      <b-row v-if="item.recipe.owner"><router-link :to="{name: 'single-user', params:{id: item.recipe.owner._id}}">{{item.recipe.owner.userID}}</router-link></b-row>
                      <b-row><small>{{ item.recipe.timestamp | dateFormat }}</small></b-row>
                      <b-row class="mt-1"  v-if="item.recipe.shared && item.recipe.likes.length > 0">
                        <b-col class="pl-0"><b-icon-heart-fill /> <span>{{item.recipe.likes.length}}</span></b-col>
                      </b-row>
                    </b-col>
                  </b-row>
                </b-col>
                <b-col class="mb-2" align="end">
                  <b-button-group>
                    <b-button :id="item.recipe._id+'-details'" v-if="item.actions.includes('details')" variant="info" @click="item.showDetails = !item.showDetails"> <b-icon-info-circle/> </b-button>
                    <b-button :id="item.recipe._id+'-edit'"  v-if="item.actions.includes('change')" variant="primary" @click="onModify(index)"> <b-icon-pencil-square /> </b-button>
                    <b-button :id="item.recipe._id+'-delete'" v-if="item.actions.includes('delete')" variant="danger" @click="onErase(index)"> <b-icon-trash-fill /> </b-button>
                    <b-button :id="item.recipe._id+'-remove'" v-if="item.actions.includes('remove')" variant="danger" @click="onErase(index, true)"> <b-icon-trash-fill/> </b-button>
                  </b-button-group>
                  <b-tooltip :target="item.recipe._id+'-details'" v-if="item.actions.includes('details')" >{{ item.showDetails ? 'Nascondi' : 'Mostra' }} Dettagli</b-tooltip>
                  <b-tooltip :target="item.recipe._id+'-edit'" v-if="item.actions.includes('change')" >Modifica</b-tooltip>
                  <b-tooltip :target="item.recipe._id+'-delete'" v-if="item.actions.includes('delete')" >Cancella</b-tooltip>
                  <b-tooltip :target="item.recipe._id+'-remove'" v-if="item.actions.includes('remove')" >Rimuovi</b-tooltip>
                </b-col>
              </b-row>
              <!-- Details -->
              <b-card class="mt-3" v-show="item.showDetails">
                <!-- Tutorial -->
                <b-row class="tutorial mb-4">
                  <b-col align="center" v-if="item.recipe.tutorial" >
                    <b-embed style="object-fit: cover; height: auto" type="video" :poster="item.recipe.img" controls >
                      <source :src="item.recipe.tutorial" type="video/mp4"  @error="tutorialNotFound">
                      Your browser does not support the video tag.
                    </b-embed>
                  </b-col>
                </b-row>
                <!-- Country, Diet & Category -->
                <b-row class="country-diet-category" cols="1" cols-sm="3">
                  <b-col v-if="item.recipe.diet && item.recipe.diet.length>0">
                    <b-form-group label-for="r-d-diet" label="Regime alimentare">
                      <b-form-input id="r-d-diet" :value="item.recipe.diet.text" readonly/>
                    </b-form-group>
                  </b-col>
                  <b-col>
                    <b-form-group label-for="r-d-category" label="Categoria">
                      <b-form-input id="r-d-category" :value="item.recipe.category.text" readonly/>
                    </b-form-group>
                  </b-col>
                  <b-col v-if="item.recipe.country" align-self="center" align="end">
                    <country-image v-model="item.recipe.country" width="50" height="50" :id="'recipe-'+item.recipe._id + '-country'" />
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
                  <!-- TODO: aggiungere lista delle persone che hanno messo mi piace. -->
                </b-row>
                <!-- Comments -->
                <b-row class="comments mx-1" v-if="item.recipe.shared && item.recipe.comments.length>0">
                  <comments v-model="item.recipe.comments" :recipeId="item.recipe._id" isOwner/>
                </b-row>

              </b-card>
            </b-list-group-item>
          </b-list-group>
          <b-row v-if="areOthers">
            <b-col align="center">
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
import {dateFormat} from "@services/utils";
import {Diets, RecipeCategories} from '@services/app'
export default {
  name: "recipe-sections",
  props:{
    id: String,
    accessToken: String,
  },
  data(){
    return {
      defaultImgRecipe: require("@assets/images/recipe-image.jpg"),
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
      tabs: [
        {
          title: 'Condivise',
          type: 'shared'
        },
        {
          title: 'Salvate',
          type: 'saved'
        },
        {
          title: 'Preferite',
          type: 'loved'
        },
        {
          title: 'Condivise in chat', //TODO: da rigurdare quando creato 'chats'
          type: 'shared-in-chat'
        }
      ],
      windowWidth: window.innerWidth,

      total: 0,
      itemsRecipes:[]
    }
  },

  computed:{

    isMobileDevice(){
      return this.windowWidth < 768
    },
    active(){
      return this.$route.query.tab
    },
    loading(){
      return this.itemsRecipes.length === 0 && this.active !== 'add'
    },
    areOthers(){
      return this.itemsRecipes.length >0 && this.itemsRecipes.length < this.total
    },
    isLoved(){
      return this.active === 'loved'
    },
    isAddRecipeTab(){
      return this.active === 'add'
    }
  },
  filters: {
    dateFormat: dateFormat
  },
  methods:{
    tutorialNotFound(e){
      console.error('tutorial ('+e.target.src+') not found')
      e.path[4].remove()
    },
    imgNotFound(e){
      console.error('image ('+e.target.src+') not found')
      e.target.src = this.defaultImgRecipe
    },

    onResize(){
      // console.debug('on resize ...')
      this.windowWidth = window.innerWidth
    },

    /* documentations */
    remapping(recipe){
      let operation = []
      switch (this.active){
        case 'saved':
          operation.push('details')
          operation.push('change')
          operation.push('delete')
          break
        case 'shared':
          operation.push('details')
          operation.push('change')
          operation.push('delete')
          break
        case 'loved':
          operation.push('remove')
          break
        case 'shared-in-chat': break
      }
      return {recipe: recipe, actions: operation, showDetails: false}
    },
    getDocs(){
      //TODO: REQUEST N RECIPES OF USER id
      let docs = this.isLoved ?
          require('@assets/examples/u-recipes-loved.js') :
          require('@assets/examples/u-recipes.js')
      this.setDefaultValueOn(docs)
      this.itemsRecipes = docs.map(r => this.remapping(r))
      this.total =  this.isLoved  ? 3: 6

      console.debug(JSON.stringify(this.itemsRecipes, null, 2))
    },
    others(){
      //TODO: REQUEST others N RECIPES OF USER id
      console.debug('Others ..')
      let docs = require('@assets/examples/u-others-recipes.js')
      this.setDefaultValueOn(docs)
      docs.map(r => this.itemsRecipes.push(this.remapping(r)))

    },
    setDefaultValueOn(docs){
      docs.forEach(recipe => {
          recipe.img = recipe.img || this.defaultImgRecipe

          // let country = this.optionsCountry.find(c => c.value === recipe.country)
          // if(country) recipe.country = country

          let category = RecipeCategories.find(recipe.category)
          if(category) recipe.category = category

          let diet = Diets.find(recipe.diet)
          if(diet) recipe.diet = diet

          recipe.shared = this.active === 'shared' /*TODO: REMOVE */
          recipe.comments = this.active === 'saved' ?  []: recipe.comments /*TODO: REMOVE */
          recipe.likes = this.active === 'saved' ?  []: recipe.likes /*TODO: REMOVE */
      })
    },

    /* search */
    search(recipeStartWith){
      //TODO: SFUTTARE GLIE ELEMENTI DELLA SEZIONE SEARCH
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

      if(!this.$route.query.mode) this.$router.push({query: {tab: this.$route.query.tab, mode: 'change'}}) //TODO: find a way to push change mode state but no in history
    },
    onChangedRecipe(cRecipe){
      console.debug('onChangedRecipe ... ')
      let old = this.itemsRecipes[this.formUpdate.index]
      this.itemsRecipes.splice(this.formUpdate.index, 1, Object.assign(old, {recipe: cRecipe}))
      this.closeChangeMode()
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
    eraseRecipe(){
      if(this.deleteRecipe.removeFromLoved){
        // TODO: REQUEST REMOVE LIKE ON RECIPE
        console.debug('REMOVE LIKE ON RECIPE')
      }else{
        // TODO: REQUEST DELETE RECIPE
        console.debug('DELETE RECIPE')
      }
      this.itemsRecipes.splice(this.deleteRecipe.index, 1)
      this.deleteRecipe = {
        index: -1,
        name: '',
        show: false,
        removeFromLoved: false
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

      if(!this.isAddRecipeTab) {
        this.itemsRecipes = []
        //TODO: REQUEST DOCUMENTS OF TYPE 'type'
        setTimeout(this.getDocs.bind(this), 1000)
      }
    },

    onShareRecipe(recipe){
      //TODO: REQUEST ADD RECIPE ON SERVER
    },
    onSaveRecipe(recipe){
      //TODO: REQUEST ADD RECIPE ON SERVER
    }
  },

  created() {
    this.$router.beforeResolve((to, from, next) =>{
      console.debug('from ', from.fullPath, ' ->  to ', to.fullPath);  console.debug(JSON.stringify(this.formUpdate))
      if(from.query.mode) this.formUpdate.show = false
      if(to.query.mode) {
        if(this.formUpdate.index===-1) {
          this.formUpdate.show = false
          return next(from.fullPath)
        }
        else this.formUpdate.show = true
      }
      next()
    })
    let isValidTab = this.tabs.find(t => t.type === this.active) || this.isAddRecipeTab
    if(!isValidTab) this.$router.push({query: { tab: 'shared'}})
    window.addEventListener('resize', this.onResize.bind(this))
  },
  mounted() {
    this.select()
  },
  beforeDestroy() {
    window.removeEventListener('resize',this.onResize.bind(this))
  }
}
</script>

<style lang="scss" scoped>
#btn-add-recipes{
  margin: 1%;
}

.recipes-section{
  overflow-y: auto;
  max-height: calc(100vh - 300px);

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