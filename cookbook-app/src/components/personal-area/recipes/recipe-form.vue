<template>
  <div>
    <wrap-loading v-model="processing">
      <b-form @submit.prevent>
        <legend v-if="title">
          {{ title }}
        </legend>

        <b-row class="mb-4">
          <b-col class="text-right">
            <span>* = campi obbligatori</span>
          </b-col>
        </b-row>
        <b-row
          cols="1"
          cols-md="2"
          cols-lg="4"
        >
          <!-- NAME  -->
          <b-col>
            <b-form-group
              label="Nome *"
              label-for="r-name"
            >
              <b-form-input
                id="r-name"
                v-model.trim="recipe.name"
                placeholder="Nome ricetta"
                :state="validation.name"
                type="text"
                @input="onInputRecipeName"
              />
            </b-form-group>
          </b-col>
          <!-- COUNTRY -->
          <b-col>
            <b-form-group
              label="Stato"
              label-for="r-country"
            >
              <custom-select
                id="r-country"
                v-model="recipe.country"
                placeholder="Seleziona ..."
                :options="countries"
              />
            </b-form-group>
          </b-col>
          <!-- DIET  -->
          <b-col>
            <b-form-group
              label="Regime alimentare"
              label-for="r-diet"
            >
              <custom-select
                id="r-diet"
                v-model="recipe.diet"
                placeholder="Seleziona ..."
                :options="diets"
              />
            </b-form-group>
          </b-col>
          <!-- CATEGORY  -->
          <b-col>
            <b-form-group
              label="Categoria *"
              label-for="r-category"
            >
              <custom-select
                id="r-category"
                v-model="recipe.category"
                placeholder="Seleziona ..."
                :options="recipeCategories"
                :state="validation.category"
                @change="onInputRecipeCategory"
              />
            </b-form-group>
          </b-col>
        </b-row>

        <!-- INGREDIENTS -->
        <fieldset class="fieldset-ingredients">
          <legend>Ingredienti *</legend>
          <food-finder
            ref="foodFinder"
            barcode-search
            food-adder
            @found="addIngredient"
          />
          <b-list-group>
            <b-list-group-item
              v-for="(ingredient, ind) in recipe.ingredients"
              :key="ingredient.food._id"
            >
              <b-row>
                <b-col
                  cols="5"
                  align-self="center"
                >
                  <font-awesome-icon
                    icon="minus"
                    class="icon"
                    @click="removeIngredient(ind)"
                  />
                  <span class="ml-3">{{ ingredient.food.name }}</span>
                </b-col>
                <b-col cols="7">
                  <b-row align-v="center">
                    <b-col>
                      <b-input-group prepend="g">
                        <b-form-input
                          v-model.number="ingredient.quantity"
                          type="number"
                          min="0.01"
                          :state="validation.ingredientQuantity[ind]"
                          @input="onInputRecipeIngredientQuantity(ind, $event)"
                        />
                      </b-input-group>
                    </b-col>
                  </b-row>
                </b-col>
              </b-row>
            </b-list-group-item>
          </b-list-group>
          <nutrients-table
            v-show="atLeastOneIngredient"
            ref="tables-nut"
            :ingredients="recipe.ingredients"
          />
        </fieldset>

        <b-row
          cols="1"
          cols-md="2"
          cols-lg="4"
        >
          <!-- PROCEDIMENTO -->
          <b-col>
            <b-form-group
              label="Procedimento *"
              label-for="r-process"
            >
              <b-form-textarea
                id="r-process"
                v-model.trim="recipe.preparation"
                :state="validation.preparation"
                rows="10"
                @input="onInputRecipePreparation"
              />
            </b-form-group>
          </b-col>
          <!-- NOTE -->
          <b-col>
            <b-form-group
              label="Note"
              label-for="r-notes"
            >
              <!--            @input="_validateRecipe"-->
              <b-form-textarea
                id="r-notes"
                v-model.trim="recipe.note"
                rows="10"
              />
            </b-form-group>
          </b-col>
          <!-- IMAGE -->
          <b-col>
            <b-row
              cols="1"
              cols-sm="1"
            >
              <b-form-group
                label="Immagine"
                label-for="r-image"
              >
                <preview-uploader
                  id="r-image"
                  ref="r-image"
                  zoomable
                  file-type="image"
                  :default="oldImage"
                  :removable="isChangeMode"
                  @selectFile="selectFile('image', $event)"
                  @cancelSelectFile="_onResetFile('image')"
                />
              </b-form-group>
            </b-row>
          </b-col>
          <!-- TUTORIAL -->
          <b-col>
            <b-row
              cols="1"
              cols-sm="1"
            >
              <b-form-group
                label="Tutorial"
                label-for="r-tutorial"
              >
                <preview-uploader
                  id="r-tutorial"
                  ref="r-tutorial"
                  file-type="video"
                  :default="oldTutorial"
                  :removable="isChangeMode"
                  @selectFile="selectFile('video', $event)"
                  @cancelSelectFile="_onResetFile('video')"
                />
              </b-form-group>
            </b-row>
          </b-col>
        </b-row>

        <!-- BUTTON ACTION -->
        <b-row>
          <b-col
            :cols="!validateRecipe ? 12: isChangeMode? 3: 4"
            class="px-0"
          >
            <b-button
              :class="resetButtonClass"
              variant="secondary"
              tabindex="-1"
              @click="resetFormRecipe"
            >
              Reset
            </b-button>
          </b-col>
          <b-col
            v-if="isChangeMode && value.shared"
            cols="9"
          >
            <b-row v-if="validateRecipe">
              <b-col class="px-0">
                <b-button
                  id="save-private"
                  title="Crea una nuova ricetta PRIVATA"
                  :class="centerButtonClass"
                  variant="success"
                  tabindex="-1"
                  @click="saved"
                >
                  Ri-Salva
                </b-button>
              </b-col>
              <b-col class="px-0">
                <b-button
                  id="save-shared"
                  title="Salva le modifiche"
                  :class="centerButtonClass"
                  variant="info"
                  tabindex="-1"
                  @click="savedChanging"
                >
                  Salva
                </b-button>
              </b-col>
              <b-col class="px-0">
                <b-button
                  id="only-shared"
                  title="Crea una nuova ricetta PUBBLICA"
                  :class="sharedButtonClass"
                  variant="primary"
                  tabindex="-1"
                  @click="shared"
                >
                  Ri-Condividi
                </b-button>
              </b-col>
            </b-row>
          </b-col>
          <b-col v-else>
            <b-row v-if="validateRecipe">
              <b-col class="px-0">
                <b-button
                  :title="isChangeMode ? 'Salva le modifiche': 'Crea una nuova ricetta PRIVATA'"
                  :class="centerButtonClass"
                  :variant="isChangeMode ? 'info': 'success'"
                  @click="saved"
                >
                  Salva
                </b-button>
              </b-col>
              <b-col class="px-0">
                <b-button
                  :title="isChangeMode ? 'Condividi ricetta' : 'Crea una nuova ricetta PUBBLICA e condividila'"
                  :class="sharedButtonClass"
                  variant="primary"
                  @click="shared"
                >
                  Condividi
                </b-button>
              </b-col>
            </b-row>
          </b-col>
        </b-row>
      </b-form>
    </wrap-loading>
  </div>
</template>

<script>

import { mapGetters } from "vuex"

export default {
    name: "RecipeForm",
    props: {
        value: {
            type: Object,
            default: undefined
        },
        title: {
            type: String,
            default: ""
        }
    },
    data() {
        return {
            processing: false,
            show: false,
            recipe: {},
            validation: {},

        }
    },
    computed:{

        ...mapGetters(["countries", "diets", "recipeCategories", "getDietByValue", "getRecipeCategoryByValue"]),
        ...mapGetters({
            accessToken: "session/accessToken",
            userIdentifier: "session/userIdentifier"
        }),

        resetButtonClass() {
            return {
                "rounded-left": this.validateRecipe,
                "w-100": true
            }
        },
        centerButtonClass() {
            return {
                "no-rounded": this.validateRecipe,
                "w-100": true
            }
        },
        sharedButtonClass() {
            return {
                "rounded-right": this.validateRecipe,
                "w-100": true
            }
        },

        oldImage() {
            return this.value ? this.value.img: ""
        },
        oldTutorial() {
            return this.value ? this.value.tutorial : ""
        },

        isChangeMode() {
            return isDefined(this.value)
        },

        equalsRecipes() {
            if (this.value)
                return this.value.country === this.recipe.country &&
                    this.value.diet.value === this.recipe.diet &&
                    this.value.category.value === this.recipe.category &&
                    this.value.img === this.recipe.img &&
                    this.recipe.name === this.value.name &&
                    this.recipe.preparation === this.value.preparation &&
                    this.recipe.note === this.value.note &&
                    this.recipe.tutorial === this.value.tutorial &&
                    this.recipe.shared === this.value.shared &&
                    equals(this.recipe.ingredients, this.value.ingredients)
            return false
        },
        validateRecipe() {
            // const formValid = Object.values(this.validation).every(p => (Array.isArray(p) && p.every(pp => pp === true)) || p === true)
            // return (!this.isChangeMode && formValid) || (this.isChangeMode && formValid && !this.equalsRecipes)
            const formValid = Object.values(this.validation).every(p => (Array.isArray(p) && p.every(pp => pp === true)) || p === true)
            let debugStr = this.isChangeMode ? "ChangeMode: " : ""; debugStr += ("formValid = " + formValid)
            if (this.isChangeMode) debugStr += (", equals = " + equals(this.recipe, this.value))
            let validity = (!this.isChangeMode && formValid) || (this.isChangeMode && formValid && !this.equalsRecipes)
            console.debug(debugStr, " => validity = ", validity)
            console.debug("validation = ", JSON.stringify(this.validation, null, 2))
            return validity
        },

        /* Nutritional table */
        atLeastOneIngredient() {
            return this.recipe.ingredients.some(n => n.quantity > 0)
        },
    },
    watch:{
        "recipe.ingredients":{
            handler(val) {
                this.onRecipeIngredient(val)
                console.debug("change ingredients = ", val)
            },
            deep: false
        },
        value(val) {
            console.debug("New Value (v-model) = " , val)
            this.resetFormRecipe()
        }
    },
    created() {
        this.resetFormRecipe()
    },
    methods: {

        /* validation form recipe */
        onInputRecipeName(name) {
            this.validation.name = name.trim().length > 0
        },
        onInputRecipePreparation(preparation) {
            this.validation.preparation = preparation.trim().length > 0
        },
        onInputRecipeCategory(category) {
            this.validation.category = category.trim().length > 0
        },
        onRecipeIngredient(ingredients) {
            this.validation.ingredients = ingredients.length > 0
            this.validation.ingredientQuantity = ingredients.map(ing => ing.quantity > 0 ? true: null)
        },
        onInputRecipeIngredientQuantity(ind, quantity) {
            this.validation.ingredientQuantity.splice(ind, 1, quantity > 0)
        },
        /* end validation form recipe */


        /*Ingredient*/
        removeIngredient(index) {
            this.recipe.ingredients.splice(index, 1)

        },
        addIngredient(food) {
            console.debug("add ingredient = ", food)
            let foundFood = this.recipe.ingredients.find(i => i.food._id === food._id)
            if (!foundFood)
                this.recipe.ingredients.push({
                    food: food,
                    quantity: 0,
                })
        },
        /* end Ingredient*/

        /* Image & Tutorial load/error */
        _onResetFile(fileType) {
            switch (fileType) {
                case "image":
                    this.recipe.img = this.isChangeMode ? this.value.img : ""
                    break
                case "video":
                    this.recipe.tutorial = this.isChangeMode ? this.value.tutorial: ""
                    break
            }
        },
        selectFile(fileType, val) {
            switch (fileType) {
                case "image":
                    this.recipe.img  = val
                    break
                case "video":
                    this.recipe.tutorial = val
                    break
            }
            console.debug("Select "+ fileType+ " = ", val)
        },
        /*end  Image & Tutorial load/error */

        /* actions: RESET, SAVE, SHARE */
        resetFormRecipe() {
            this.validation = {
                name: null,
                preparation: null,
                category: null,
                ingredients: null,
                ingredientQuantity: [],
            }
            this.recipe = {
                name: "",
                country: "",
                category: undefined,
                preparation: "",
                note: "",
                diet: undefined,
                ingredients: [],
                img: "",
                tutorial: "",
                shared: false,
            }
            console.debug("Reset form create recipe ...")

            if (this.$refs["r-image"]) this.$refs["r-image"].cancelChanges()
            else this._onResetFile("image")
            if (this.$refs["r-tutorial"]) this.$refs["r-tutorial"].cancelChanges()
            else this._onResetFile("video")


            if (this.value) {
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

        _setOptionSelection(_recipe, before) {
            if (before) {
                _recipe.category = _recipe.category ? _recipe.category.value: undefined
                _recipe.diet =  _recipe.diet ? _recipe.diet.value : undefined
            } else {
                _recipe.category = this.getRecipeCategoryByValue(_recipe.category) || ""
                _recipe.diet = this.getDietByValue(_recipe.diet) || ""
            }
        },

        _newRecipe(eventType, options = { shared: undefined, new: false }) {
            console.debug("OPT = ", options, ", changeMode = ", this.isChangeMode !== undefined)

            // const formData = this._formData(options)
            this._formData(options)
                .then(formData => {
                    console.debug("Ready form data ")
                    let request
                    this.processing = true

                    if (options.new === false) {
                        console.debug("Changed recipe ")
                        // console.debug(this.recipe)
                        request = this.$store.dispatch("recipes/update", { _id: this.value._id, body: formData })
                    } else {
                        console.debug("New recipe ")
                        // console.debug(this.recipe)
                        request = this.$store.dispatch("recipes/create", formData)
                    }

                    request
                        .then(({ data }) => {

                            if (this.isChangeMode) {
                                this._setOptionSelection(data, false)
                                this.$emit("onChanged", data)

                                if (options.new) {
                                    let event
                                    if (data.shared === false) {
                                        event = "recipe:create:saved"
                                        console.debug("Saved a private copy of a shared recipe.")
                                    }
                                    if (data.shared === true) {
                                        event = "recipe:create"
                                        console.debug("Create a new shared recipe from a old shared recipe.")
                                    }
                                    if (event) this.$socket.emit(event, data)
                                } else {
                                    console.debug("Update a " + (data.shared ? "shared" : "saved") + " recipe.")
                                    this.$socket.emit("recipe:update", data)
                                    if (this.value.shared === false && data.shared === true) {
                                        console.debug("Share and/or update a saved recipe.")
                                        this.$socket.emit("recipe:create", data)
                                    }
                                }

                            } else {
                                this.$emit(eventType, data)
                                this.resetFormRecipe()
                                this.$socket.emit(data.shared ? "recipe:create" : "recipe:create:saved", data)
                            }

                        })
                        .catch(err => {
                            if (options.new === false) this.$store.$api.errorsHandler.recipes.updateRecipe(err)
                            else this.$store.$api.errorsHandler.recipes.createRecipe(err)
                        })
                        .finally(() => this.processing = false)
                })

        },

        async _formData(options = { shared: undefined, new: false }) {
            const formData = new FormData()

            function addOnFormData(k, v) {
                if (Array.isArray(v)) formData.append(k, JSON.stringify(v))
                else if (v instanceof File && v.size === 0) formData.append(k, "")
                else formData.append(k, v)
            }

            const copyRecipe = clone(this.recipe)
            copyRecipe.ingredients.forEach(i => i.food = i.food._id)
            if (!copyRecipe.diet) copyRecipe.diet = ""
            if (isBoolean(options.shared)) copyRecipe.shared = options.shared

            if (options.new) {
                try {
                    copyRecipe.img =  await ReaderStreamImage.toFile(copyRecipe.img)
                } catch (e) {
                    /*ignored*/
                    console.error("Image: ",e)
                }
                try {
                    copyRecipe.tutorial = await ReaderStreamVideo.toFile(copyRecipe.tutorial)
                } catch (e) {
                    /*ignored*/
                    console.error("Tutorial: ", e)
                }
            }
            if (!(copyRecipe.img instanceof File)) delete copyRecipe.img
            if (!(copyRecipe.tutorial instanceof File)) delete copyRecipe.tutorial

            Object.entries(copyRecipe).forEach(([k, v]) => addOnFormData(k, v))
            for (const i of formData.entries()) console.debug(i)

            console.debug(options.new ? "Create ...": "Update ...")
            return formData
        },

        savedChanging() {
            //only in change mode
            this._newRecipe("onSavedChanging", { new: false })
        },
        saved() {
            let options = { shared: false, new: true }
            if (this.isChangeMode && this.value.shared === false) options.new = false

            // create mode : {shared: false, new: true}
            // change mode
            // value.shared == true ->   // {shared: false, new: true}
            // value.shared == false (saved) ->   // {shared: false, new: false}

            this._newRecipe("onSaved", options)
        },
        shared() {
            let options = { shared: true, new: true }
            if (this.isChangeMode && this.value.shared === false) options.new = false

            // create mode : {shared: true, new: true}
            // change mode
            // value.shared == true ->   // {shared: true, new: true}
            // value.shared == false (saved) ->   // {shared: true, new: false}

            this._newRecipe("onShared",options)
        },
    }
}
</script>

<style lang="scss" scoped>
form {
  margin: 1%;
  padding: 10px;

  & .fieldset-ingredients {
    border: 1px solid;
    border-radius: 10px;
    padding: 1%;
    margin-bottom: 25px;

    & > legend {
      width: fit-content;
      padding: 0 5px;
    }
  }
}
</style>
