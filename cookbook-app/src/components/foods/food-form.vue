<template>
  <wrap-loading v-model="saving">
    <b-container fluid>
      <b-row class="mb-3">
        <b-col class="text-right">
          <span> * = campi obbligatori </span>
        </b-col>
      </b-row>
      <b-row
        cols="1"
        cols-sm="1"
      >
        <b-col>
          <b-row
            cols="1"
            cols-md="2"
            align-h="center"
          >
            <b-col>
              <b-form-group
                label="Nome *"
                label-for="f-name"
              >
                <b-form-input
                  id="f-name"
                  v-model.trim="food.name"
                  type="text"
                  min="0.01"
                  :state="validation.name"
                  @input="onInputFoodName"
                />
              </b-form-group>
            </b-col>
            <b-col>
              <b-form-group
                label="Codice a barre"
                label-for="f-barcode"
              >
                <b-form-input
                  id="f-barcode"
                  v-model.trim="food.barcode"
                  type="text"
                />
              </b-form-group>
            </b-col>
          </b-row>
        </b-col>

        <b-col>
          <fieldset>
            <legend> Valori nutrizionali per 100g </legend>

            <b-row
              cols="1"
              cols-sm="2"
            >
              <b-col>
                <b-form-group
                  label="Energia *"
                  label-for="f-energy"
                >
                  <b-input-group prepend="kcal">
                    <b-form-input
                      id="f-energy"
                      v-model.number="food.nutritional_values.energy"
                      type="number"
                      min="0.01"
                      :state="validation.energy"
                      @input="onInputFoodEnergy"
                    />
                  </b-input-group>
                </b-form-group>
              </b-col>
              <b-col>
                <b-form-group
                  label="Proteine"
                  label-for="f-protein"
                >
                  <b-input-group prepend="g">
                    <b-form-input
                      id="f-protein"
                      v-model.number="food.nutritional_values.protein"
                      type="number"
                      min="0.01"
                    />
                  </b-input-group>
                </b-form-group>
              </b-col>
            </b-row>

            <fieldset class="bordered">
              <legend>Carboidrati</legend>
              <b-row
                cols="1"
                cols-sm="2"
              >
                <b-col>
                  <b-form-group
                    label="Complessi"
                    label-for="f-carbohydrates"
                  >
                    <b-input-group prepend="g">
                      <b-form-input
                        id="f-carbohydrates"
                        v-model.number="food.nutritional_values.carbohydrates.complex"
                        type="number"
                        min="0.01"
                      />
                    </b-input-group>
                  </b-form-group>
                </b-col>

                <b-col>
                  <b-form-group
                    label="Zuccheri"
                    label-for="f-sugar"
                  >
                    <b-input-group prepend="g">
                      <b-form-input
                        id="f-sugar"
                        v-model.number="food.nutritional_values.carbohydrates.sugar"
                        type="number"
                        min="0.01"
                      />
                    </b-input-group>
                  </b-form-group>
                </b-col>
              </b-row>
            </fieldset>

            <fieldset class="bordered mb-3">
              <legend>Grassi</legend>
              <b-row
                cols="1"
                cols-sm="2"
              >
                <b-col>
                  <b-form-group
                    label="Insaturi"
                    label-for="f-fat"
                  >
                    <b-input-group prepend="g">
                      <b-form-input
                        id="f-fat"
                        v-model.number="food.nutritional_values.fat.unsaturated"
                        type="number"
                        min="0.01"
                      />
                    </b-input-group>
                  </b-form-group>
                </b-col>

                <b-col>
                  <b-form-group
                    label="Saturi"
                    label-for="f-sat-fat"
                  >
                    <b-input-group prepend="g">
                      <b-form-input
                        id="f-sat-fatr"
                        v-model.number="food.nutritional_values.fat.saturated"
                        type="number"
                        min="0.01"
                      />
                    </b-input-group>
                  </b-form-group>
                </b-col>
              </b-row>
            </fieldset>

            <b-form-group
              label="Sale"
              label-for="f-sale"
            >
              <b-input-group prepend="mg">
                <b-form-input
                  id="f-sale"
                  v-model.number="food.nutritional_values.salt"
                  type="number"
                  min="0.1"
                />
              </b-input-group>
            </b-form-group>
          </fieldset>
        </b-col>



        <b-col class="col-12 d-flex justify-content-between">
          <b-button @click="resetForm">
            Reset
          </b-button>
          <b-button
            v-if="validate"
            variant="primary"
            @click="saveFood"
          >
            Salva
          </b-button>
        </b-col>
      </b-row>
    </b-container>
  </wrap-loading>
</template>

<script>

import { mapGetters } from "vuex"

export default {
    name: "FoodForm",
    props: {
        value: {
            type: Object,
            default() {
                return {}
            }
        },
        mode: {
            type: String,
            default: "create",
            enum: ["create", "update"]
        }
    },
    data() {
        return {
            food: {},
            validation: {
                name: null,
                energy: null
            },
            saving: false
        }
    },
    computed: {
        validate() {
            const valid = Object.values(this.validation).every(p => p === true)
            if (this.updateMode) return valid && !this.areEquals(this.food, this.value)
            return valid
        },
        updateMode() {
            return this.mode === "update"
        },
        createMode() {
            return this.mode === "create"
        },

        ...mapGetters({
            accessToken: "session/accessToken"
        })
    },
    watch: {
        validation: {
            handler(val) {
                // console.debug('valid food = ', val)
                this.$emit("valide-food", Object.values(val).every(p => p === true))
            },
            deep: true
        }
    },
    created() {
        console.debug(`${this.updateMode ? "update": "create"}  form FOOD ...`)
        this.resetForm()
        this.setFormFood()
    },
    beforeDestroy() {
    //console.debug('beforeDestroy: ', this.food)
        if (this.createMode) this.$emit("input", this.food)
    },
    methods: {
        areEquals(food, value) {
            return food.name === value.name &&
             food.barcode === value.barcode &&
             food.nutritional_values.energy === value.nutritional_values.energy &&

             (food.nutritional_values.salt === value.nutritional_values.salt ||
                 (food.nutritional_values.salt === 0 && !value.nutritional_values.salt)) &&
             (food.nutritional_values.protein === value.nutritional_values.protein ||
                 (food.nutritional_values.protein === 0 && !value.nutritional_values.protein)) &&
             (equals(food.nutritional_values.fat, value.nutritional_values.fat) ||
                 (equals(food.nutritional_values.fat, { unsaturated:0, saturated: 0 }) && !value.nutritional_values.fat)) &&
             (equals(food.nutritional_values.carbohydrates, value.nutritional_values.carbohydrates) ||
                 (equals(food.nutritional_values.carbohydrates, { complex:0, sugar: 0 }) && !value.nutritional_values.carbohydrates))
        },

        resetForm() {
            if (this.updateMode) this.resetUpdateMode()
            else this.resetCreateMode()
        },

        resetCreateMode() {
            this.validation = {
                name: null,
                energy: null
            }
            this.food = {
                name: "",
                barcode: "",
                nutritional_values: {
                    energy: 0,
                    protein: 0,
                    fat: {
                        unsaturated: 0,
                        saturated: 0
                    },
                    carbohydrates: {
                        complex: 0,
                        sugar: 0
                    },
                    salt: 0
                }
            }
            console.debug("Reset form food ...")
        },

        resetUpdateMode() {
            this.resetCreateMode()
            this.setFormFood()
        },

        setFormFood() {
            if (!isEmpty(this.value)) {
                this.food.name = this.value.name
                this.food.barcode = this.value.barcode
                if (this.value.nutritional_values)
                    this.food.nutritional_values = Object.assign(this.food.nutritional_values, clone(this.value.nutritional_values))

                this.onInputFoodName(this.food.name)
                this.onInputFoodEnergy(this.food.nutritional_values.energy)
            }
            console.debug("Value = ", JSON.stringify(this.value))
            console.debug("FOOD = ", JSON.stringify(this.food))
        },

        onInputFoodName(name) {
            if (name) this.validation.name = name.trim().length > 0
        },
        onInputFoodEnergy(energy) {
            if (energy) this.validation.energy = energy > 0
        },

        saveFood() {
            let request = null
            switch (this.mode) {
                case "create":
                    request = this.$store.dispatch("foods/create", this.food)
                    break
                case "update":
                    request = this.$store.dispatch("foods/update", { _id: this.value._id, body: this.food })
                    break
                default: throw new Error("mode is not valid.")
            }
            this.saving = true
            request
                .then(({ data }) => {
                    console.debug(data)

                    if (this.createMode) {
                        this.food = data
                        this.$socket.emit("food:create", data)
                    } else if (this.updateMode) this.$socket.emit("food:update", data)

                    this.$emit("onSave", data)
                    this.resetForm()
                })
                .catch(err => {
                    if (this.createMode) return this.$store.$api.errorsHandler.foods.createFood(err)
                    else if (this.updateMode) return this.$store.$api.errorsHandler.foods.updateFood(err)
                    return false
                })
                .then(duplicate => {
                    if (this.createMode && duplicate) this.$emit("onDuplicateGenerate")
                    this.saving = false
                })
        }
    }
}
</script>

<style scoped>
/* stylelint-disable no-empty-source */
</style>
