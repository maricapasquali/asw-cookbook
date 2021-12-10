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
            <b-form-input @focus="_showDropdown" id="find-ingredient" placeholder="Ingrediente" v-model="startWith" @input="findFoods" ref="find-ingredient" type="search" autocomplete="off"/>
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

import api from '@api'
import {Session} from "@services/session";

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

      foods: []
    }
  },
  computed: {
    atLeastResult(){
      return this.foods.length > 0
    },
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

       api.foods
          .getFoods(Session.accessToken(), {barcode: barcodeNumber})
          .then(({data}) => {
            console.debug(data)
            if (data.total === 0) throw new Error(`Barcode (${barcodeNumber}) is not found`)
            else this.$emit('found', data.items[0])
          })
          .catch(err => {
            //TODO: HANDLER ERROR FOUND FOOD WITH BARCODE == 'barcodeNumber'
            console.error(err);
            this.onError({ barcode: barcodeNumber, error: 'not found' })
          })

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
      if(_startWith.length === 0) {
        this.foods = []
      }
      else {
        api.foods
           .getFoods(Session.accessToken(), {name: _startWith})
           .then(({data}) => {
             console.debug(data)
             this.foods = data.items
             this.hideDropdown = false
           })
           //TODO: HANDLER ERROR LIST INGREDIENT that start with 'ingredientStart'
           .catch(err => this.foods = [])
      }
    },

    onSaveFood(food){
      if(this.foodAdder){
        this.$emit('found', food)
        this.addFood = { show: false, food: {} }
      } else throw new Error('FoodAdder: Funzionalità non attivata.')
    },

    onSelectFood(food){
      this.$emit('found', food)
      this.startWith = ''
    },

    async getFood(foodID){
      return await api.foods
                      .getFood(foodID, Session.accessToken())
                      .then(({data}) => data)
                      .catch(err => {
                        //TODO: HANDLER ERROR GET ONE FOOD
                        console.error(err);
                        return { nutritional_values: {} }
                      })
    },
  },

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