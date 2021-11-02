<template>
  <div>
    <!-- ADD FOODS --->
    <b-modal v-model="addFood.show" title="Nuovo ingrediente" hide-footer>
      <food-form v-model="addFood.food" @onSave="onSaveFood"/>
    </b-modal>

    <!-- FIND FOODS WITH BARCODE --->
    <b-modal v-model="barcodeScan.show" hide-footer>
      <b-row>
        <b-col>
          <StreamBarcodeReader @decode="onDecode" @error="onError" />
        </b-col>
      </b-row>
      <b-row align-h="between" align-v="center" class="mt-2">
        <b-col>
          <b-form-group label-for="s-barcode" class="mb-0">
            <b-form-input type="search" id="s-barcode" placeholder="codice a barre" v-model="barcodeScan.code" @keyup.enter="onDecode(barcodeScan.code)"/>
          </b-form-group>
        </b-col>
      </b-row>
    </b-modal>

    <b-row align-v="center" class="mx-1">
      <b-col cols="10" sm="11">
        <b-form-group label="Trova" label-for="find-ingredient" id="ingredient-group" >
          <div v-outside="_hideDropdownOutSide" >
            <b-form-input @focus="_showDropdown"  id="find-ingredient" placeholder="Ingrediente" v-model="startWith" ref="find-ingredient" type="text" autocomplete="off"/>
            <b-list-group class="find-foods" v-show="!hideDropdown">
              <b-list-group-item v-for="food in foods" :key="food._id" @click="onSelectFood(food)" v-html="_boldStartWith(food.name)" />
            </b-list-group>
            <font-awesome-icon id="barcode-scan" class="icon" icon="barcode" @click="barcodeScan.show = true"/>
          </div>
        </b-form-group>
      </b-col>
      <b-col cols="2" sm="1" align="center" class="pl-0 pr-3 mt-3">
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
  components:{ ImageBarcodeReader, StreamBarcodeReader },
  data(){
    return {

      barcodeScan: {
        show: false,
        code: ''
      },
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

    foods(){
      if(this.startWith.length === 0) return [];
      else {
        //TODO: REQUEST LIST INGREDIENT that start with 'ingredientStart'
        let founds = this.allFoods.filter(ingredient => ingredient.name.startsWith(this.startWith))
        this.hideDropdown = founds.length === 0
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
      console.debug('On focus : show = ', !this.hideDropdown)
    },
    _hideDropdownOutSide(){
      this.hideDropdown = true
      console.debug('Hide dropdown (outside).')
    },

    /*barcode scan*/
    resetFormBarcode(){
      this.barcodeScan = {
        show: false,
        code: ''
      }
    },
    onDecode (barcodeNumber) {
      console.debug('On decode = ', barcodeNumber)
      this.barcodeScan.code = barcodeNumber
      //TODO: REQUEST FOUND FOOD WITH BARCODE == 'barcodeNumber'
      let found = this.allFoods.find(food => food.barcode === barcodeNumber)
      if(found) {
        this.$emit('found', found)
        this.resetFormBarcode()
      }
      else this.onError({ barcode: barcodeNumber, error: 'not found' })
    },
    onError(e){
      console.error('On Error = ', e)
      // barcode not found
      this.resetFormBarcode();
      this.addFood.show = true
      this.addFood.food.barcode = e.barcode
    },
    /*endbarcode*/

    onSaveFood(food){
      this.allFoods.push(food)
      this.$emit('found', food)
      this.addFood = { show: false, food: {} }
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

  input{
    padding-right: 36px;
    text-overflow: ellipsis;
  }

  .find-foods{
    position: absolute;
    width: 100%;
    z-index: 1;
    overflow-y: auto;
    max-height: 100px;
    & > div {
      padding: 10px;
      cursor: default;
      &:hover {
        background-color: lightgray;
      }
    }
  }

  #barcode-scan{
    position: absolute;
    right: 10px;
    top: 62%;
  }
}

</style>