<template>
  <div>
    <!-- ADD FOODS --->
    <b-modal v-model="addFood.show" title="Nuovo ingrediente" hide-footer>
      <food-form mode="create" v-model="addFood.food" @onSave="onSaveFood" @onDuplicateGenerate="addFood.show=false"/>
    </b-modal>

    <b-row align-v="center" class="mx-1">
      <b-col :cols="foodAdder ? 10: 12" :sm="foodAdder ? 11: 12" :class="{'pr-0': !foodAdder}">
        <b-form-group label="Trova" label-for="find-ingredient" id="ingredient-group" :class="{'with-barcode': barcodeSearch}">
          <div v-outside="_hideDropdownOutSide" >
            <b-form-input @focus="_showDropdown" id="find-ingredient" placeholder="Ingrediente" v-model="startWith" ref="find-ingredient" type="search" autocomplete="off"/>
            <div v-show="!hideDropdown && startWith.length>0">
              <b-list-group class="find-foods" v-if="atLeastResult">
                <b-list-group-item v-for="food in foods" :key="food._id" @click="onSelectFood(food)" v-html="_boldStartWith(food.name)" />
              </b-list-group>
              <b-list-group class="find-foods" v-else><b-list-group-item><strong>Nessun risultato ...</strong></b-list-group-item></b-list-group>
            </div>
            <barcode-scanner position="absolute" @onFound="onDecode" @onError="onError" :show="barcodeSearch"/>
          </div>
        </b-form-group>
      </b-col>
      <b-col cols="2" sm="1" align="center" class="pl-0 pr-3 mt-3" v-if="foodAdder">
        <font-awesome-icon size="2x" icon="plus-circle" class="icon" @click="addFood.show = true"/>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import outside from '@components/directives/outside' // CLICK FUORI
import {ImageBarcodeReader, StreamBarcodeReader} from "vue-barcode-reader";
export default {
  name: "food-finder",
  directives: {outside},
  components:{ImageBarcodeReader, StreamBarcodeReader },
  props: {
    barcodeSearch: {
      type: Boolean,
      default: false
    },
    foodAdder:{
      type: Boolean,
      default: false
    }
  },
  data(){
    return {

      addFood: {
        show: false,
        food: {},
      },

      hideDropdown: false,
      startWith: '',
      allFoods:[],
    }
  },
  computed: {
    atLeastResult(){
      return this.foods.length > 0
    },
    foods(){
      if(this.startWith.length === 0) return [];
      else {
        let founds = this.findFoods(this.startWith)
        this.hideDropdown = false
        return founds
      }
    }
  },
  methods: {
    _boldStartWith(text){
      let len = this.startWith.length
      return `<b>${text.substring(0, len)}</b>${text.substring(len, text.length)}`
    },
    _showDropdown(){
      this.hideDropdown = this.startWith.length === 0
    },
    _hideDropdownOutSide(){
      this.hideDropdown = true
    },

    /*barcode scan*/
    onDecode (barcodeNumber) {
     if(this.barcodeSearch){
       console.debug('FoodFinder : On found = ', barcodeNumber)
       //TODO: REQUEST FOUND FOOD WITH BARCODE == 'barcodeNumber'
       let found = this.allFoods.filter(food => food.barcode && food.barcode.startsWith(barcodeNumber))
       if(found.length) this.$emit('found', found)
       else this.onError({ barcode: barcodeNumber, error: 'not found' })
     } else throw new Error('BarcodeSearch: Funzionalità non attivata.')
    },
    onError(e){
      console.debug('FoodFinder : On Error = ', e)
      this.$emit('not-found', e)
      // barcode not found
      if(this.foodAdder) {
        this.addFood.show = true
        this.addFood.food.barcode = e.barcode
      }
    },
    /*endbarcode*/

    findFoods(_startWith){
      //TODO: REQUEST LIST INGREDIENT that start with 'ingredientStart'
      return this.allFoods.filter(ingredient => ingredient.name.startsWith(_startWith))
    },

    onSaveFood(food){
      if(this.foodAdder){
        this.allFoods.push(food)
        this.$emit('found', food)
        this.addFood = { show: false, food: {} }
      } else throw new Error('FoodAdder: Funzionalità non attivata.')
    },

    onSelectFood(food){
      this.$emit('found', food)
      this.startWith = ''
    },


    requestAllFoods(){
      //TODO: REQUEST ALL FOODS
      this.allFoods = require('@assets/examples/foods.js')
    },

    getNutritionalValues(id){
      let food = this.allFoods.find(food => food._id === id)
      return food ? food.nutritional_values : {}
    },
  },
  created() {
   this.requestAllFoods()
  }
}
</script>

<style lang="scss" scoped>

#ingredient-group {
  position: relative;

  &.with-barcode{
    input {
      padding-right: 36px;
    }
  }
  input{
    text-overflow: ellipsis;
  }


  .find-foods{
    position: absolute;
    width: 100%;
    z-index: 1;
    overflow-y: auto;
    max-height: 100px;
    box-shadow: 0 8px 7px 0 grey;
    & > div {
      padding: 10px;
      cursor: default;
      &:hover {
        background-color: lightgray;
      }
    }
  }
}

</style>