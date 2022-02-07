<template>
  <div>

    <wrap-loading  v-model="processing" >
      <b-form @submit="">
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
                  :options="countries" />
            </b-form-group>
          </b-col>
          <!-- DIET  -->
          <b-col>
            <b-form-group label="Regime alimentare" label-for="r-diet">
              <b-form-select id="r-diet" v-model.trim="recipe.diet" :options="diets" >
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
                             :options="recipeCategories"
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
            <b-list-group-item v-for="(ingredient, ind) in recipe.ingredients" :key="ingredient.food._id">
              <b-row >
                <b-col cols="5" align-self="center">
                  <font-awesome-icon icon="minus" @click="removeIngredient(ind)" class="icon"/>
                  <span class="ml-3">{{ ingredient.food.name }}</span>
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
              <b-form-group label="Immagine" label-for="r-image" >
                <preview-uploader id="r-image" ref="r-image"
                                  zoomable
                                  file-type="image"
                                  :default="oldImage"
                                  @selectFile="selectFile('image', $event)"
                                  @cancelSelectFile="_onResetFile('image')"
                                  :removable="isChangeMode"
                />
              </b-form-group>
            </b-row>
          </b-col>
          <!-- TUTORIAL -->
          <b-col>
            <b-row cols="1" cols-sm="1">
              <b-form-group label="Tutorial" label-for="r-tutorial" >
                <preview-uploader id="r-tutorial"
                                  ref="r-tutorial"
                                  file-type="video"
                                  :default="oldTutorial"
                                  @selectFile="selectFile('video', $event)"
                                  @cancelSelectFile="_onResetFile('video')"
                                  :removable="isChangeMode"
                />
              </b-form-group>
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

import {mapGetters} from "vuex";

export default {
  name: "recipe-form",
  props: {
    value: Object,
    title: String
  },
  data(){
    return {
      processing: false,
      show: false,
      recipe: {},
      validation: {},

    }
  },
  computed:{

    ...mapGetters(['countries', 'diets', 'recipeCategories', 'getDietByValue', 'getRecipeCategoryByValue']),
    ...mapGetters({
      accessToken: 'session/accessToken',
      userIdentifier: 'session/userIdentifier'
    }),

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

    oldImage(){
      return this.value ? this.value.img: ''
    },
    oldTutorial(){
      return this.value ? this.value.tutorial : ''
    },

    isChangeMode(){
      return typeof this.value !== 'undefined'
    },

    equalsRecipes(){
     return this.value.country === this.recipe.country &&
             this.value.diet.value === this.recipe.diet &&
             this.value.category.value === this.recipe.category &&
             this.value.img === this.recipe.img
      && this.recipe.name === this.value.name &&
         this.recipe.preparation === this.value.preparation &&
         this.recipe.note === this.value.note &&
         this.recipe.tutorial === this.value.tutorial &&
         this.recipe.shared === this.value.shared &&
         equals(this.recipe.ingredients, this.value.ingredients)
    },
    validateRecipe(){
      // const formValid = Object.values(this.validation).every(p => (Array.isArray(p) && p.every(pp => pp === true)) || p === true)
      // return (!this.isChangeMode && formValid) || (this.isChangeMode && formValid && !this.equalsRecipes)
      const formValid = Object.values(this.validation).every(p => (Array.isArray(p) && p.every(pp => pp === true)) || p === true)
      let debugStr = this.isChangeMode ? 'ChangeMode: ' : ''; debugStr += ('formValid = ' + formValid)
      if(this.isChangeMode) debugStr += (', equals = ' + equals(this.recipe, this.value))
      let validity = (!this.isChangeMode && formValid) || (this.isChangeMode && formValid && !this.equalsRecipes)
      console.debug(debugStr, ' => validity = ', validity)
      console.debug('validation = ', JSON.stringify(this.validation, null, 2))
      return validity
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
      console.debug('Val = ' , val)
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
      let foundFood = this.recipe.ingredients.find(i => i.food._id === food._id)
      if(!foundFood)
        this.recipe.ingredients.push({
          food: food,
          quantity: 0,
        })
    },
    /* end Ingredient*/

    /* Image & Tutorial load/error */
    _onResetFile(fileType){
      switch (fileType){
        case 'image':
          this.recipe.img = this.isChangeMode ? this.value.img : ''
          break;
        case 'video':
          this.recipe.tutorial = this.isChangeMode ? this.value.tutorial: ''
          break;
      }
    },
    selectFile(fileType, val){
      switch (fileType){
        case 'image':
          this.recipe.img  = val
          break;
        case 'video':
          this.recipe.tutorial = val
          break;
      }
      console.debug('Select '+ fileType+ ' = ', val)
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

      if(this.$refs['r-image']) this.$refs['r-image'].cancelChanges()
      else this._onResetFile('image')
      if(this.$refs['r-tutorial']) this.$refs['r-tutorial'].cancelChanges()
      else this._onResetFile('video')


      if(this.value){
        this.validation = {
          name: true,
          preparation: true,
          ingredients: true,
          category: true,
          ingredientQuantity: Array.from(this.value.ingredients).fill(true)
        }

        Object.assign(this.recipe, clone(this.value))

        delete this.recipe._id
        delete this.recipe.owner
        delete this.recipe.permission
        delete this.recipe.likes
        delete this.recipe.__v
        delete this.recipe.comments
        delete this.recipe.createdAt
        delete this.recipe.updatedAt
        this._setOptionSelection(this.recipe, true)

        console.debug(`Reset form update recipe (value) = ${JSON.stringify(this.value, null,1 )}...`)
        console.debug(`Reset form update recipe (recipe) = ${JSON.stringify(this.recipe, null, 1)}...`)

      }
    },

    _setOptionSelection(_recipe, before){
      if(before){
        _recipe.category = _recipe.category ? _recipe.category.value: undefined
        _recipe.diet =  _recipe.diet ? _recipe.diet.value : undefined
      }else{
        _recipe.category = this.getRecipeCategoryByValue(_recipe.category) || ''
        _recipe.diet = this.getDietByValue(_recipe.diet) || ''
      }
    },

    _newRecipe(eventType, options = {shared: undefined, new: false}){
      console.debug('OPT = ', options, ', changeMode = ', this.isChangeMode !== undefined)

      let request = null

      const formData = this._formData(options)

      this.processing = true

      if(options.new === false){
        console.log('Changed recipe ')
        // console.debug(this.recipe)
        request = this.$store.dispatch('recipes/update', {_id: this.value._id, body: formData})
      }
      else{
        console.log('New recipe ')
        // console.debug(this.recipe)
        request = this.$store.dispatch('recipes/create', formData)
      }

      request
          .then(({data}) => {

            if(this.isChangeMode) {
              this._setOptionSelection(data, false)
              this.$emit('onChanged', data)

              this.$socket.emit('recipe:update', data)
              if(this.value.shared === false && data.shared === true) {
                console.log('Share a saved recipe.')
                this.$socket.emit('recipe:create', data)
              }
            } else {
              this.$emit(eventType, data)
              this.resetFormRecipe()
              if(data.shared) this.$socket.emit('recipe:create', data)
            }
          })
          .catch(err => {
            if(options.new === false) this.handleRequestErrors.recipes.updateRecipe(err)
            else this.handleRequestErrors.recipes.createRecipe(err)
          })
          .finally(() => this.processing = false)
    },

    _formData(options = {shared: undefined, new: false}){
      const formData = new FormData()

      const addOnFormData = (k, v) => {
        if(Array.isArray(v)) formData.append(k, JSON.stringify(v))
        else formData.append(k, v)
      }

      const copyRecipe = clone(this.recipe)
      copyRecipe.ingredients.forEach(i => i.food = i.food._id)
      if(!copyRecipe.diet) copyRecipe.diet = ''
      if(isBoolean(options.shared)) copyRecipe.shared = options.shared
      if(!(copyRecipe.img instanceof File)) delete copyRecipe.img
      if(!(copyRecipe.tutorial instanceof File)) delete copyRecipe.tutorial

      Object.entries(copyRecipe).forEach(([k, v]) => addOnFormData(k, v))
      //for(const i of formData.entries()) console.log(i)

      console.log(options.new ? 'Create ...': 'Update ...')
      return formData;
    },

    savedChanging(){
      //only in change mode
      this._newRecipe('onSavedChanging', {new: false})
    },
    saved(){
      let options = {shared: false, new: true}
      if(this.isChangeMode && this.value.shared === false) options.new = false

      // create mode : {shared: false, new: true}
      // change mode
        // value.shared == true ->   // {shared: false, new: true}
        // value.shared == false (saved) ->   // {shared: false, new: false}

      this._newRecipe('onSaved', options)
    },
    shared(){
      let options = {shared: true, new: true}
      if(this.isChangeMode && this.value.shared === false) options.new = false

      // create mode : {shared: true, new: true}
      // change mode
        // value.shared == true ->   // {shared: true, new: true}
        // value.shared == false (saved) ->   // {shared: true, new: false}

      this._newRecipe('onShared',options)
    },
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