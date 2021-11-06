<template>
  <b-container fluid>
    <b-row cols="1" cols-sm="1">
      <b-col>
        <b-row cols="1" cols-md="2" align-h="center">
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
        </b-row>
      </b-col>

      <b-col>
        <fieldset>
          <legend> Valori nutrizionali per 100g </legend>

          <b-row cols="1" cols-sm="2">
            <b-col>
              <b-form-group label="Energia" label-for="f-energy">
                <b-input-group prepend="kcal">
                  <b-form-input id="f-energy" type="number" min="0.01"
                                v-model.number="food.nutritional_values.energy"
                                :state="validation.energy"
                                @input="onInputFoodEnergy"/>
                </b-input-group>
              </b-form-group>
            </b-col>
            <b-col>
              <b-form-group label="Proteine" label-for="f-protein">
                <b-input-group prepend="g">
                  <b-form-input id="f-protein" type="number" min="0.01" v-model.number="food.nutritional_values.protein"/>
                </b-input-group>
              </b-form-group>
            </b-col>
          </b-row>

         <fieldset class="bordered">
           <legend>Carboidrati</legend>
           <b-row cols="1" cols-sm="2">
             <b-col>
               <b-form-group label="Complessi" label-for="f-carbohydrates">
                 <b-input-group prepend="g">
                   <b-form-input id="f-carbohydrates" type="number" min="0.01" v-model.number="food.nutritional_values.carbohydrates.complex"/>
                 </b-input-group>

               </b-form-group>
             </b-col>

             <b-col>
               <b-form-group label="Zuccheri" label-for="f-sugar">
                 <b-input-group prepend="g">
                   <b-form-input id="f-sugar" type="number" min="0.01" v-model.number="food.nutritional_values.carbohydrates.sugar"/>
                 </b-input-group>
               </b-form-group>
             </b-col>
           </b-row>
         </fieldset>

         <fieldset class="bordered mb-3">
           <legend>Grassi</legend>
           <b-row cols="1" cols-sm="2">
             <b-col>
               <b-form-group label="Insaturi" label-for="f-fat">
                 <b-input-group prepend="g">
                   <b-form-input id="f-fat" type="number" min="0.01" v-model.number="food.nutritional_values.fat.unsaturated"/>
                 </b-input-group>
               </b-form-group>
             </b-col>

             <b-col>
               <b-form-group label="Saturi" label-for="f-sat-fat" >
                 <b-input-group prepend="g">
                   <b-form-input id="f-sat-fatr" type="number" min="0.01" v-model.number="food.nutritional_values.fat.saturated"/>
                 </b-input-group>
               </b-form-group>
             </b-col>
           </b-row>
         </fieldset>

          <b-form-group label="Sale" label-for="f-sale">
            <b-input-group prepend="mg">
              <b-form-input id="f-sale" type="number" min="0.1" v-model.number="food.nutritional_values.sale" @input="onInputFoodNutrient('sale')"/>
            </b-input-group>
          </b-form-group>
        </fieldset>
      </b-col>



      <b-col  class="col-12 d-flex justify-content-between">
        <b-button @click="resetForm">Reset</b-button>
        <b-button v-if="validate" @click="saveFood" variant="primary">Salva</b-button>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import {Session} from '@services/session'
import {isEmpty, clone, equals} from '@services/utils'
export default {
  name: "food-form",
  props: {
    value: {
      type: Object,
      default: function (){
        return {}
      }
    },
    mode: {
      type: String,
      default: 'create',
      enum: ['create', 'update']
    }
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
      const valid = Object.values(this.validation).every(p => p === true)
      if(this.updateMode) return valid && !this.areEquals(this.food, this.value)
      return valid
    },
    updateMode: function (){
      return this.mode === 'update'
    },
    createMode: function (){
      return this.mode === 'create'
    }
  },
  watch: {
    validation: {
      handler(val){
        // console.debug('valid food = ', val)
        this.$emit('valide-food', Object.values(val).every(p => p === true))
      },
      deep: true
    }
  },
  methods: {
    areEquals: function (food, value){
      return food.name === value.name &&
             food.barcode === value.barcode &&
             food.nutritional_values.energy === value.nutritional_values.energy &&

             (food.nutritional_values.sale === value.nutritional_values.sale ||
                 (food.nutritional_values.sale === 0 && !value.nutritional_values.sale)) &&
             (food.nutritional_values.protein === value.nutritional_values.protein ||
                 (food.nutritional_values.protein === 0 && !value.nutritional_values.protein)) &&
             (equals(food.nutritional_values.fat, value.nutritional_values.fat) ||
                 (equals(food.nutritional_values.fat, {unsaturated:0, saturated: 0}) && !value.nutritional_values.fat)) &&
             (equals(food.nutritional_values.carbohydrates, value.nutritional_values.carbohydrates) ||
                 (equals(food.nutritional_values.carbohydrates, {complex:0, sugar: 0}) && !value.nutritional_values.carbohydrates))
    },

    resetForm(){
      if(this.updateMode) this.resetUpdateMode()
      else this.resetCreateMode()
    },

    resetCreateMode(){
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

    resetUpdateMode(){
      this.resetCreateMode();
      this.setFormFood()
    },

    setFormFood(){
      if(!isEmpty(this.value)) {
        this.food.name = this.value.name
        this.food.barcode = this.value.barcode
        if(this.value.nutritional_values)
          this.food.nutritional_values = Object.assign(this.food.nutritional_values, clone(this.value.nutritional_values))

        this.onInputFoodName(this.food.name)
        this.onInputFoodEnergy(this.food.nutritional_values.energy)
      }
      console.debug('Value = ', JSON.stringify(this.value));
      console.debug('FOOD = ', JSON.stringify(this.food))
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
      let sessionInfo = Session.userInfo()
      this.food.owner = {
        user: {_id: sessionInfo._id, userID: sessionInfo.userID},
        timestamp: Date.now()
      }

      let justInsert = require('@assets/examples/foods.js').find(f => f.name === this.food.name)

      if(this.createMode && justInsert ) {
        this.$emit('onDuplicateGenerate')
      }else{
        this.$emit('onSave', this.food)
      }

    },
  },
  created() {
    console.debug(`${this.updateMode ? 'update': 'create'}  form FOOD ...`)
    this.resetForm()
    this.setFormFood()
  },
  beforeDestroy() {
    console.debug('beforeDestroy: ', this.food)
    this.$emit('input', this.food)
  }
}
</script>

<style lang="scss" scoped>
</style>