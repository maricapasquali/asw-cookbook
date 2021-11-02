<template>
  <b-form>
    <b-row cols="1" cols-sm="1">
      <b-col>
        <b-form-group label="Nome" label-for="f-name">
          <b-form-input id="f-name" type="text" min="0.01"
                        v-model.trim="food.name"
                        :state="validation.name"
                        @input="onInputFoodName"/>
        </b-form-group>
      </b-col>
      <b-col>
        <b-form-group label="Codice a barre" label-for="f-barcode">
          <b-form-input id="f-barcode" type="text" v-model.trim="food.barcode"/>
        </b-form-group>
      </b-col>
      <b-col>
        <fieldset>
          <legend> Valori nutrizionali per 100g </legend>

          <b-form-group label="Energia" label-for="f-energy">
            <b-input-group prepend="kcal">
              <b-form-input id="f-energy" type="number" min="0.01"
                            v-model.number="food.nutritional_values.energy"
                            :state="validation.energy"
                            @input="onInputFoodEnergy"/>
            </b-input-group>
          </b-form-group>

          <b-form-group label="Proteine" label-for="f-protein">
            <b-input-group prepend="g">
              <b-form-input id="f-protein" type="number" min="0.01" v-model.number="food.nutritional_values.protein"/>
            </b-input-group>
          </b-form-group>

          <div>
            <b-form-group label="Carboidrati" label-for="f-carbohydrates">
              <b-input-group prepend="g">
                <b-form-input id="f-carbohydrates" type="number" min="0.01" v-model.number="food.nutritional_values.carbohydrates.complex"/>
              </b-input-group>

            </b-form-group>

            <b-form-group label="Zuccheri" label-for="f-sugar" class="ml-5">
              <b-input-group prepend="g">
                <b-form-input id="f-sugar" type="number" min="0.01" v-model.number="food.nutritional_values.carbohydrates.sugar"/>
              </b-input-group>
            </b-form-group>
          </div>

          <div>
            <b-form-group label="Grassi" label-for="f-fat">
              <b-input-group prepend="g">
                <b-form-input id="f-fat" type="number" min="0.01" v-model.number="food.nutritional_values.fat.unsaturated"/>
              </b-input-group>
            </b-form-group>

            <b-form-group label="Grassi saturi" label-for="f-sat-fat" class="ml-5">
              <b-input-group prepend="g">
                <b-form-input id="f-sat-fatr" type="number" min="0.01" v-model.number="food.nutritional_values.fat.saturated"/>
              </b-input-group>
            </b-form-group>
          </div>

          <b-form-group label="Sale" label-for="f-sale">
            <b-input-group prepend="mg">
              <b-form-input id="f-sale" type="number" min="0.1" v-model.number="food.nutritional_values.sale"/>
            </b-input-group>
          </b-form-group>
        </fieldset>
      </b-col>
      <b-col  class="col-12 d-flex justify-content-between">
        <b-button @click="resetForm">Reset</b-button>
        <b-button v-if="validate" @click="saveFood" variant="primary">Salva</b-button>
      </b-col>
    </b-row>

  </b-form>
</template>

<script>
import {isEmpty} from '@services/utils'
export default {
  name: "food-form",
  props: {
    value: Object
  },
  data(){
    return {
      food: {},
      validation: {
        name: null,
        energy: null
      }
    }
  },
  computed: {
    validate(){
      return Object.values(this.validation).every(p => p === true)
    }
  },
  watch: {
    food(val, old){
      console.log('change food: ',  old, ' => ' , val)
      this.$emit('input', val)
    },
    validation: {
      handler(val){
        // console.debug('valid food = ', val)
        this.$emit('valide-food', Object.values(val).every(p => p === true))
      },
      deep: true
    }
  },
  methods: {
    resetForm(){
      this.validation = {
        name: null,
        energy: null
      }
      this.food = {
        name: '',
        barcode: '',
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
          sale: 0
        }
      }
      console.debug('Reset form food ...')
    },

    setFormFood(){
      this.resetForm()
      if(!isEmpty(this.value)) {
        this.food = Object.assign(this.food, this.value)
        this.onInputFoodName(this.food.name)
        this.onInputFoodEnergy(this.food.nutritional_values.energy)
      }
      // console.debug('Value= ', JSON.stringify(this.value)); console.debug('FOOD = ', JSON.stringify(this.food))
    },

    onInputFoodName(name){
      if(name) this.validation.name = name.trim().length > 0
    },
    onInputFoodEnergy(energy){
      if(energy) this.validation.energy = energy > 0
    },

    saveFood(){
      //TODO: REQUEST SAVE FOOD
      this.food._id = 'food-10'  //TODO: remove
      this.$emit('onSave', this.food)
    },
  },
  created() {
    console.debug('create form FOOD ...')
    this.setFormFood()
  }
}
</script>

<style scoped>

</style>