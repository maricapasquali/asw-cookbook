<template>
  <b-table striped :items="getItems" :fields="fields"></b-table>
</template>

<script>
import Vue from 'vue'
import FoodFinder from '@components/personal-area/foods/food-finder'

export default {
  name: "nutrients-table",
  props:{
    value: Object,
    ingredients: {
      type: Array,
      default: function (){
        return []
      }
    }
  },
  watch: {
    ingredients:{
      handler(val){
        this.makeTable(val)
      },
      deep: true
    },
    value(val){
      this.table = this.convertObjToArray(val)
    }
  },
  data(){
    return {
      nutrients: [
        { value: 'energy', text: 'Energia (kcal)' },
        { value: 'protein', text: 'Proteine (g)' },
        { value: 'fat', text: 'Grassi (g)' },
        { value: 'saturated_fat', text: 'grassi saturi (g)' },
        { value: 'carbohydrates', text: 'Carboidrati (g)' },
        { value: 'sugar', text: 'zuccheri (g)' },
        { value: 'sale', text: 'sale (mg)' },
      ],
      fields: [
        {
          key: 'nutrient_label',
          label: 'Nutriente',
        },
        {
          key: 'value100',
          label: 'Valore per 100 g',
        }
      ],
      table: []
    }
  },
  computed:{
    getItems(){
      return this.table.map(item => {
        item.nutrient_label = this.nutrients.find(n => n.value === item.nutrient).text;
        return item
      })
    }
  },

  methods:{
    convertObjToArray(nObj){
      if(!nObj) return this.emptyNutritionalTable()
      let array = []
      array.push({nutrient: 'energy', value100: nObj.energy || 0})
      array.push({nutrient: 'protein', value100: nObj.protein || 0})
      array.push({nutrient: 'fat', value100: nObj.fat && nObj.fat.unsaturated ? nObj.fat.unsaturated: 0})
      array.push({nutrient: 'saturated_fat', value100: nObj.fat && nObj.fat.saturated ? nObj.fat.saturated: 0})
      array.push({nutrient: 'carbohydrates', value100: nObj.carbohydrates && nObj.carbohydrates.complex ? nObj.carbohydrates.complex : 0})
      array.push({nutrient: 'sugar', value100: nObj.carbohydrates && nObj.carbohydrates.sugar ? nObj.carbohydrates.sugar: 0})
      array.push({nutrient: 'sale', value100: nObj.sale || 0})
      return array
    },

    emptyNutritionalTable(){
      return this.nutrients.map(n => ({nutrient: n.value, value100: 0.0}))
    },

    fillNutritionalTable(nutritionalValues, nutrVlsIngrs){
      let _nutrVlsIngrs = nutrVlsIngrs.map(n => n.nutrients)
      let totQuantities = nutrVlsIngrs.map(n => n.quantity).reduce((x, y) => x + y, 0.0)

      let nutritionals = (nutrient) => {

        switch (nutrient){
          case 'energy': return _nutrVlsIngrs.map(nn => nn.energy);
          case 'protein': return _nutrVlsIngrs.map(nn => nn.protein);
          case 'fat': return _nutrVlsIngrs.map(nn => nn.fat.unsaturated);
          case 'saturated_fat': return _nutrVlsIngrs.map(nn => nn.fat.saturated);
          case 'carbohydrates': return _nutrVlsIngrs.map(nn => nn.carbohydrates.complex);
          case 'sugar': return _nutrVlsIngrs.map(nn => nn.carbohydrates.sugar);
          case 'sale': return _nutrVlsIngrs.map(nn => nn.sale);
          default: return []
        }
      }
      nutritionalValues.forEach(n =>
          n.value100 = ((nutritionals(n.nutrient).reduce((x, y) => x + y, 0.0) *100) / totQuantities).toFixed(0)
      )
    },

    calc(quantity,  nutritionalValues100, xNumber) {
      let nutritionalValues = {
        energy: (quantity * (nutritionalValues100.energy || 0) / xNumber),
        protein: (quantity * (nutritionalValues100.protein || 0) / xNumber),
        sale: (quantity * (nutritionalValues100.sale || 0) / xNumber),
        fat: {unsaturated: 0, saturated: 0},
        carbohydrates: {complex: 0, sugar: 0}
      }
      if(nutritionalValues100.fat)
        nutritionalValues.fat = {
          unsaturated: (quantity * (nutritionalValues100.fat.unsaturated || 0) / xNumber),
          saturated: (quantity * (nutritionalValues100.fat.saturated || 0) / xNumber),
        }
      if(nutritionalValues100.carbohydrates)
        nutritionalValues.carbohydrates = {
          complex: (quantity * (nutritionalValues100.carbohydrates.complex || 0) / xNumber),
          sugar:(quantity * (nutritionalValues100.carbohydrates.sugar || 0) / xNumber),
        }
      return nutritionalValues
    },

    makeTable(ingredients){
      let nutrientsForIngredient = ingredients.map(food =>
          ({quantity: food.quantity || 0, nutrients: this.calc(food.quantity || 0, this.foodFinder.getNutritionalValues(food.foodID),  100)})
     )
      this.fillNutritionalTable(this.table, nutrientsForIngredient)
      this.$emit('input', this.table)
    }
  },
  created() {
    const FoodFinderComponentClass = Vue.extend(FoodFinder)
    this.foodFinder = new FoodFinderComponentClass()
    this.table = this.convertObjToArray(this.value)
    if(this.ingredients.length > 0) this.makeTable(this.ingredients)
  }
}
</script>

<style scoped>

</style>