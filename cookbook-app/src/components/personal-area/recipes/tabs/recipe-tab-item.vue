<template>
  <b-container fluid class="recipes-section-item" >
    <!-- Recipe: BaseInfo + Actions -->
    <b-row class="ml-2" cols="1" cols-md="2">
      <b-col class="mb-2">
        <b-row>
          <preview-recipe-image class="col col-3 px-0" v-model="item.recipe.img" />
          <b-col class="ml-3">
            <b-row>
              <strong>
                <div v-if="isLoved && item.recipe.owner">
                  <router-link :to="{name: 'single-recipe', params: {id: item.recipe.owner._id, recipe_id: item.recipe._id } }">{{item.recipe.name}}</router-link>
                </div>
                <span v-else> {{item.recipe.name}} </span>
              </strong>
            </b-row>
            <b-row v-if="noMyRecipe">
              <router-link :to="{name: 'single-user', params:{id: item.recipe.owner._id}}">{{item.recipe.owner.userID}}</router-link>
            </b-row>
            <b-row><small> Data di creazione: {{ item.recipe.createdAt | dateFormat }}</small></b-row>
            <b-row><small> Data di ultima modifica: {{ item.recipe.updatedAt | dateFormat }}</small></b-row>

            <b-row class="mt-1"  v-show="item.recipe.shared && item.recipe.likes.length > 0">
              <like v-model="item.recipe.likes" :recipe="item.recipe" noLike variant="light"/>
            </b-row>
          </b-col>
        </b-row>
      </b-col>
      <b-col class="text-right mb-2" >
        <b-button-group>
          <b-button :title="toggleDetailTitle" v-if="includeActionDetails" variant="info" v-b-toggle="toggleDetailId"> <b-icon-info-circle/> </b-button>

          <b-button :title="toggleChangeTitle" v-if="includeActionChange" variant="primary"  v-b-toggle="toggleChangeId"> <b-icon-pencil-square /> </b-button>

          <b-button title="Condividi senza modificare"  v-if="includeActionDirectlyShared" variant="light" @click="onDirectlyShared"> <b-icon-share /> </b-button>

          <b-button title="Duplicazione privata senza modificare"  v-if="includeActionDirectlySaved" variant="light" @click="onDirectlySaved"> <b-icon-files /> </b-button>

          <b-button title="Cancella" v-if="includeActionDelete" variant="danger" @click="onErase(false)"> <b-icon-trash-fill /> </b-button>

          <b-button title="Rimuovi" v-if="includeActionRemove" variant="danger" @click="onErase(true)"> <b-icon-trash-fill/> </b-button>
        </b-button-group>
      </b-col>
    </b-row>

    <!-- Details -->
    <b-collapse :id="toggleDetailId" v-model="item.showDetails" @show="updateForm = false">
      <b-card class="mt-3">
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
            <country-image v-model="item.recipe.country" width="50" height="50" :id="'country-'+item.recipe._id" />
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

        <!-- Permissions -->
        <b-row v-if="item.recipe.permission">
          <b-col>
            <permission-list v-model="item.recipe.permission" :id="permissionId"/>
          </b-col>
        </b-row>

        <!-- Comments -->
        <b-row cols="1" class="comments mx-1 mt-2" v-if="item.recipe.shared && item.recipe.comments.length>0">
          <b-col class="px-0"><strong>Commenti</strong></b-col>
          <b-col class="px-0"> <comments v-model="item.recipe.comments" :recipe="item.recipe" /></b-col>
        </b-row>

      </b-card>
    </b-collapse>

    <!-- Change recipe form -->
    <b-collapse :id="toggleChangeId" @show="onShowChangeForm">
      <b-card no-body v-if="updateForm.show">
        <recipe-form title="Modifica ricetta" v-model="updateForm.recipe" @onChanged="onChangedRecipe"/>
      </b-card>
    </b-collapse>
  </b-container>
</template>

<script>
import {mapGetters} from "vuex";

import UserMixin from '@mixins/user.mixin'
export default {
  name: "recipe-tab-item",
  mixins: [UserMixin],
  props: {
    mode: {
      type: String,
      default: "retrieve"
    },
    selectedType: String,
    position: Number,
    item: {
      recipe: Object,
      actions: Array,
      showDetails: Boolean
    }
  },
  data(){
    return {
      directShared: false,
      directSaved: false,
      deleteRecipe: false,

      updateForm: {
        show: false,
        recipe: null
      }
    }
  },
  filters: {
    dateFormat: function (text){
      return dateFormat(text)
    },

  },
  computed: {
    ...mapGetters({
      userIdentifier: 'session/userIdentifier',
    }),
    toggleDetailId(){
      return `${this.mode}-details-${this.item.recipe._id}`
    },
    toggleDetailTitle(){
      return (this.item.showDetails ? 'Nascondi' : 'Mostra') +  ' Dettagli'
    },

    toggleChangeId(){
      return  `${this.mode}-change-mode-${this.item.recipe._id}`
    },
    toggleChangeTitle(){
      return (this.updateForm ? 'Chiudi' : 'Apri') +  ' modifica ricetta'
    },

    permissionId(){
      return `permission-${this.item.recipe._id}`
    },

    includeActionDetails(){
      return this.item.actions.includes('details')
    },
    includeActionChange(){
      return this.item.actions.includes('change')
    },
    includeActionDirectlyShared(){
      return this.item.actions.includes('directly-shared')
    },
    includeActionDirectlySaved(){
      return this.item.actions.includes('directly-saved')
    },
    includeActionDelete(){
      return this.item.actions.includes('delete')
    },
    includeActionRemove(){
      return this.item.actions.includes('remove')
    },

    isLoved(){
      return this.selectedType === 'loved'
    },

    noMyRecipe(){
      return this.item.recipe.owner && this.item.recipe.owner._id !== this.userIdentifier
    }
  },
  methods: {
    tutorialNotFound(e){
      console.error('tutorial ('+e.target.src+') not found')
      e.target.parentNode.parentNode.remove()
    },

    /* - SAVED RECIPE: SHARE ONLY */
    onDirectlyShared(){
      this.$emit('onClickDirectlyShared', this.item.recipe, this.position)
    },
    /* - SHARED RECIPE: SAVE ONLY */
    onDirectlySaved(){
        this.$emit('onClickDirectlySaved', this.item.recipe,  this.position)
    },
    /* - DELETE OR REMOVE */
    onErase(loved){
      this.$emit('onClickErase', this.item.recipe,  this.position, loved)
    },
    /* - CHANGE */
    onShowChangeForm(){
      this.item.showDetails = false
      this.updateForm = {
        recipe: clone(this.item.recipe),
        show: true
      }
    },
    onHideChangeForm(){
      this.updateForm = {
        show: false,
        recipe: null
      }
    },
    onChangedRecipe(cRecipe){
      this.$emit('onChangedRecipe', cRecipe, this.position)
      this.onHideChangeForm()
    },
    /* Listeners update */
    onUpdateInfos(userInfo) {
      if(this.item.recipe.owner?._id === userInfo?._id) this._updateUserInformation(this.item.recipe.owner, userInfo)
    },
    onDeletedUserListeners(id){
      if(this.item.recipe.owner?._id === id) this.item.recipe.owner = null
    },
  },
  created() {
    this.$bus.$on('user:update:info', this.onUpdateInfos.bind(this))
    this.$bus.$on('user:delete', this.onDeletedUserListeners.bind(this))
  },
  beforeDestroy() {
    this.$bus.$off('user:update:info', this.onUpdateInfos.bind(this))
    this.$bus.$off('user:delete', this.onDeletedUserListeners.bind(this))
  }
}
</script>

<style lang="scss" scoped>
</style>