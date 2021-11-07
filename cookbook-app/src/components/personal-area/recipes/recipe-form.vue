<template>
  <div>

    <wrap-loading  v-model="processing" >
      <b-form>
        <legend v-if="title"> {{ title }} </legend>

        <b-row cols="1" cols-md="2"   cols-lg="4">
          <!-- NAME  -->
          <b-col>
            <b-form-group label="Nome" label-for="r-name">
              <b-form-input id="r-name"
                            placeholder="Nome ricetta"
                            v-model.trim="recipe.name"
                            @input="onInputRecipeName"
                            :state="validation.name" type="text"/>
            </b-form-group>
          </b-col>
          <!-- COUNTRY -->
          <b-col>
            <b-form-group label="Stato" label-for="r-country">
              <select-with-image
                  id="r-country"
                  v-model="recipe.country"
                  placeholder="Seleziona ..."
                  type="text"
                  :options="optionsCountry" />
            </b-form-group>
          </b-col>
          <!-- DIET  -->
          <b-col>
            <b-form-group label="Regime alimentare" label-for="r-diet">
              <b-form-select id="r-diet" v-model.trim="recipe.diet" :options="optionsDiet" >
                <template #first>
                  <b-form-select-option value="undefined" disabled> Seleziona ... </b-form-select-option>
                </template>
              </b-form-select>
            </b-form-group>
          </b-col>
          <!-- CATEGORY  -->
          <b-col>
            <b-form-group label="Categoria" label-for="r-category">
              <b-form-select id="r-category"
                             v-model.trim="recipe.category"
                             :options="optionsCategory"
                             :state="validation.category"
                             @change="onInputRecipeCategory" >
                <template #first>
                  <b-form-select-option value="undefined" disabled> Seleziona ... </b-form-select-option>
                </template>
              </b-form-select>
            </b-form-group>
          </b-col>
        </b-row>

        <!-- INGREDIENTS -->
        <fieldset class="fieldset-ingredients">
          <legend>Ingredienti</legend>
          <food-finder @found="addIngredient" ref="foodFinder" barcode-search food-adder/>
          <b-list-group >
            <b-list-group-item v-for="(ingredient, ind) in recipe.ingredients" :key="ingredient._id">
              <b-row >
                <b-col cols="5" align-self="center">
                  <font-awesome-icon icon="minus" @click="removeIngredient(ind)" class="icon"/>
                  <span class="ml-3">{{ ingredient.name }}</span>
                </b-col>
                <b-col cols="7">
                  <b-row align-v="center">
                    <b-col>
                      <b-input-group prepend="g">
                        <b-form-input type="number" min="0.01"
                                      v-model.number="ingredient.quantity"
                                      :state="validation.ingredientQuantity[ind]"
                                      @input="onInputRecipeIngredientQuantity(ind, $event)"/>
                      </b-input-group>
                    </b-col>
                  </b-row>
                </b-col>
              </b-row>
            </b-list-group-item>
          </b-list-group>
          <nutrients-table v-show="atLeastOneIngredient" :ingredients="recipe.ingredients" ref="tables-nut"/>

        </fieldset>

        <b-row cols="1" cols-md="2" cols-lg="4">
          <!-- PROCEDIMENTO -->
          <b-col>
            <b-form-group label="Procediemento" label-for="r-process">
              <b-form-textarea id="r-process" v-model.trim="recipe.preparation"
                               :state="validation.preparation"
                               @input="onInputRecipePreparation"
                               rows="10"></b-form-textarea>
            </b-form-group>
          </b-col>
          <!-- NOTE -->
          <b-col>
            <b-form-group label="Note" label-for="r-notes">
              <!--            @input="_validateRecipe"-->
              <b-form-textarea id="r-notes" v-model.trim="recipe.note" rows="10"></b-form-textarea>
            </b-form-group>
          </b-col>
          <!-- IMAGE -->
          <b-col>
            <b-row cols="1" cols-sm="1">
              <b-col>
                <b-row>
                  <b-col cols="9">
                    <b-form-group label="Immagine" label-for="r-image" >
                      <b-form-file id="r-image" type="file" accept="image/jpeg, image/png" @change="selectImage" ref="r-image"/>
                    </b-form-group>
                  </b-col>
                  <b-col cols="3" align-self="center" class="px-0">
                    <b-button class="mt-3" tabindex="-1" @click="_onResetFile('image')">Reset</b-button>
                  </b-col>
                </b-row>
              </b-col>
              <b-col v-show="recipe.img.length > 0">
                <b-img fluid id="img-preview" :src="recipe.img"/>
              </b-col>
            </b-row>
          </b-col>
          <!-- TUTORIAL -->
          <b-col>
            <b-row cols="1" cols-sm="1">
              <b-col>
                <b-row>
                  <b-col cols="9">
                    <b-form-group label="Tutorial" label-for="r-tutorial" >
                      <b-form-file id="r-tutorial" type="file" accept="video/mp4" @change="selectTutorial" ref="r-tutorial"/>
                    </b-form-group>
                  </b-col>
                  <b-col cols="3" align-self="center" class="px-0" >
                    <b-button class="mt-3" tabindex="-1" @click="_onResetFile('video')">Reset</b-button>
                  </b-col>
                </b-row>

              </b-col>
              <b-col v-show="recipe.tutorial.length > 0">
                <video id="tutorial-preview" :src="recipe.tutorial" controls />
              </b-col>
            </b-row>
          </b-col>
        </b-row>

        <!-- BUTTON ACTION -->
        <b-row>
          <b-col :cols="!validateRecipe ? 12: isChangeMode? 3: 4" class="px-0">
            <b-button :class="resetButtonClass" variant="secondary" @click="resetFormRecipe" tabindex="-1">Reset</b-button>
          </b-col>
          <b-col cols="9" v-if="isChangeMode && value.shared">
            <b-row v-if="validateRecipe">
              <b-col class="px-0" >
                <b-button :class="centerButtonClass" id="save-private" variant="success" @click="saved" tabindex="-1"> Salva </b-button>
                <b-tooltip target="save-private" triggers="hover"><p> Crea una nuova ricetta PRIVATA </p></b-tooltip>
              </b-col>
              <b-col class="px-0" >
                <b-button :class="centerButtonClass" id="save-shared" variant="info" @click="savedChanging" tabindex="-1"> Ri-Salva </b-button>
                <b-tooltip target="save-shared" triggers="hover"><p> Salva le modifiche </p></b-tooltip>
              </b-col>
              <b-col class="px-0" >
                <b-button :class="sharedButtonClass" id="only-shared" variant="primary" @click="shared" tabindex="-1"> Ri-Condividi</b-button>
                <b-tooltip target="only-shared" triggers="hover"><p> Crea una nuova ricetta PUBBLICA </p></b-tooltip>
              </b-col>
            </b-row>
          </b-col>
          <b-col v-else>
            <b-row v-if="validateRecipe">
              <b-col class="px-0" >
                <b-button :class="centerButtonClass" variant="success" @click="saved">Salva</b-button>
              </b-col>
              <b-col class="px-0" >
                <b-button :class="sharedButtonClass"  variant="primary" @click="shared">Condividi</b-button>
              </b-col>
            </b-row>
          </b-col>
        </b-row>

      </b-form>
    </wrap-loading>
  </div>
</template>

<script>
import { ReaderStreamImage, ReaderStreamVideo } from '@services/filesystem'
import {clone, equals} from '@services/utils'
import {Countries, Diets, RecipeCategories} from '@services/app'

export default {
  name: "recipe-form",
  props: {
    value: Object,
    title: String
  },
  data(){
    return {
      defaultImgRecipe: require("@assets/images/recipe-image.jpg"),
      optionsCountry: Countries.get(),
      optionsDiet: Diets.get(),
      optionsCategory: RecipeCategories.get(),

      processing: false,
      show: false,
      recipe: {},
      validation: {},

    }
  },
  computed:{
    resetButtonClass(){
      return {
        'rounded-left': this.validateRecipe,
        'w-100': true
      }
    },
    centerButtonClass(){
      return {
        'no-rounded': this.validateRecipe,
        'w-100': true
      }
    },
    sharedButtonClass(){
      return {
        'rounded-right': this.validateRecipe,
        'w-100': true
      }
    },

    isChangeMode(){
      return this.value
    },

    equalsRecipes(){
     return this.value.country === this.recipe.country &&
             this.value.diet.value === this.recipe.diet &&
             this.value.category.value === this.recipe.category &&
             (this.value.img === this.recipe.img || '' === this.recipe.img)
      && this.recipe.name === this.value.name &&
         this.recipe.preparation === this.value.preparation &&
         this.recipe.note === this.value.note &&
         this.recipe.tutorial === this.value.tutorial &&
         this.recipe.shared === this.value.shared &&
         equals(this.recipe.ingredients, this.value.ingredients)
    },
    validateRecipe(){
      const formValid = Object.values(this.validation).every(p => (Array.isArray(p) && p.every(pp => pp === true)) || p === true)
      // let debugStr = this.isChangeMode ? 'ChangeMode: ' : ''; debugStr += ('formValid = ' + formValid)
      // if(this.isChangeMode) debugStr += (', equals = ' + equals(this.recipe, this.value))
      return (!this.isChangeMode && formValid) || (this.isChangeMode && formValid && !this.equalsRecipes)
      // let validity = (!this.isChangeMode && formValid) || (this.isChangeMode && formValid && !this.equalsRecipes)
      // console.debug(debugStr, ' => validity = ', validity)
      // console.debug('validation = ', JSON.stringify(this.validation, null, 2))
      // return validity
    },

    /* Nutritional table */
    atLeastOneIngredient(){
      return this.recipe.ingredients.some(n => n.quantity > 0)
    },
  },
  watch:{
    'recipe.ingredients':{
      handler(val){
        this.onRecipeIngredient(val)
        console.debug('change ingredients = ', val)
      },
      deep: false
    },
    value(val){
      console.log('Val = ' , val)
      this.recipe = val
    }
  },
  methods: {

    /* validation form recipe */
    onInputRecipeName(name){
      this.validation.name = name.trim().length > 0
    },
    onInputRecipePreparation(preparation){
      this.validation.preparation = preparation.trim().length > 0
    },
    onInputRecipeCategory(category){
      this.validation.category = category.trim().length > 0
    },
    onRecipeIngredient(ingredients){
      this.validation.ingredients = ingredients.length > 0
      this.validation.ingredientQuantity = ingredients.map(ing => ing.quantity > 0 ? true: null)
    },
    onInputRecipeIngredientQuantity(ind, quantity){
      this.validation.ingredientQuantity.splice(ind, 1, quantity > 0)
    },
    /* end validation form recipe */


    /*Ingredient*/
    removeIngredient(index){
      this.recipe.ingredients.splice(index, 1)

    },
    addIngredient(food){
      console.debug('add ingredient = ', food)
      let _food = food[0]
      let foundFood =  this.recipe.ingredients.find(f => f.foodID === _food._id)
      if(!foundFood)
        this.recipe.ingredients.push({
          foodID: _food._id,
          name: _food.name,
          quantity: 0,
        })
    },
    /* end Ingredient*/

    /* Image & Tutorial load/error */
    _onLoadFile(fileType, event){
      switch (fileType){
        case 'image':
          this.recipe.img = event.target.result
          console.debug('load image')
          //console.debug(this.recipe.img)
          break;
        case 'video':
          this.recipe.tutorial = event.target.result
          console.debug('load video')
          // console.debug(this.recipe.tutorial)
          break;
      }
    },
    _onErrorFile(fileType, error){
      console.error(fileType, ' -> ' , error)
    },
    _onResetFile(fileType){
      switch (fileType){
        case 'image':
          this.recipe.img = this.isChangeMode ? this.value.img : ''
          let inputImage = this.$refs['r-image']
          if(inputImage) inputImage.reset()
          break;
        case 'video':
          this.recipe.tutorial = this.isChangeMode ? this.value.tutorial: ''
          let inputTutorial = this.$refs['r-image']
          if(inputTutorial) inputTutorial.reset()
          break;
      }
    },
    selectImage(event){
      let fileType = 'image'
      ReaderStreamImage.read(event.target.files[0],
          this._onLoadFile.bind(this, fileType),
          this._onErrorFile.bind(this, fileType))
    },
    selectTutorial(event){
      let fileType = 'video'
      ReaderStreamVideo.read(event.target.files[0],
          this._onLoadFile.bind(this, fileType),
          this._onErrorFile.bind(this, fileType))
    },
    /*end  Image & Tutorial load/error */

    /* actions: RESET, SAVE, SHARE */
    resetFormRecipe(){
      this.validation = {
        name: null,
        preparation: null,
        category: null,
        ingredients: null,
        ingredientQuantity: [],
      }
      this.recipe = {
        name: '',
        country: '',
        category: undefined,
        preparation: '',
        note: '',
        diet: undefined,
        ingredients: [],
        img: '',
        tutorial: '',
        shared: false,
      }
      console.debug('Reset form create recipe ...')

      this._onResetFile('image')
      this._onResetFile('video')


      if(this.value){
        this.validation = {
          name: true,
          preparation: true,
          ingredients: true,
          category: true,
          ingredientQuantity: Array.from(this.value.ingredients).fill(true)
        }

        Object.entries(this.recipe).forEach(([k, v]) => { if(!this.value.hasOwnProperty(k)) this.value[k] = v })
        this.recipe = clone(this.value)
        this._setOptionSelection(true)

        console.debug(`Reset form update recipe (value) = ${JSON.stringify(this.value)}...`)
        console.debug(`Reset form update recipe (recip) = ${JSON.stringify(this.recipe)}...`)


      }
    },

    _setOptionSelection(before){
      if(before){
        if(this.defaultImgRecipe === this.recipe.img) this.recipe.img = ''
        this.recipe.category = this.recipe.category ? this.recipe.category.value: undefined
        this.recipe.diet =  this.recipe.diet ? this.recipe.diet.value : undefined
      }else{
        if('' === this.recipe.img) this.recipe.img = this.defaultImgRecipe
        this.recipe.category = RecipeCategories.find(this.recipe.category) || ''
        this.recipe.diet = Diets.find(this.recipe.diet) || ''
      }
    },

    _newRecipe(eventType, opt = {shared: false, changed: false}){
      this.processing = true
      console.log('OPT = ', opt, ', changeMode = ', this.isChangeMode)
      if(opt.changed){
        // TODO: REQUEST modify RECIPE
        console.log('Changed recipe ', this.recipe)

      }else{
        this.recipe.shared = opt.shared
        // TODO: REQUEST add new RECIPE
        console.log('New recipe ', this.recipe)
      }
      this.$emit('input', this.recipe)
      if(this.isChangeMode) {
        this._setOptionSelection(false)

        this.$emit('onChanged', this.recipe)
      }
      else {
        this.$emit(eventType, this.recipe)
        this.resetFormRecipe()
      }
      this.processing = false
    },

    savedChanging(){
      this._newRecipe('onSavedChanging', {changed: true})
    },
    saved(){
      this._newRecipe('onSaved', {shared: true})
    },
    shared(){
      this._newRecipe('onShared',{shared: true})
    }
  },
  created() {
    this.resetFormRecipe();
  }
}
</script>

<style lang="scss" scoped>

form{
  margin: 1%;
  padding: 10px;

  #tutorial-preview {
    width: 100%;
  }

  & .fieldset-ingredients{
    border: 1px solid;
    border-radius: 10px;
    padding: 1%;
    margin-bottom: 25px;
    & >legend {
      width: fit-content;
      padding: 0 5px;
    }
  }
}
</style>