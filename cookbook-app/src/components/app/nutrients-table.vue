<template>
  <b-skeleton-wrapper :loading="isTableEmpty">
    <template #loading>
      <b-skeleton-table :rows="7" :columns="2" :table-props="{ bordered: true, striped: true }"/>
    </template>
    <b-table class="nutritional-table" v-resize="onResize" striped :items="getItems" :fields="fields" :stacked="isMobile"></b-table>
  </b-skeleton-wrapper>
</template>

<script>

export default {
  name: "nutrients-table",
  props:{
    value: Object,
    ingredients: {
      type: Array, /*
        [{
           quantity: number,
           food: {
              nutritional_values: {
                  energy: number,
                  protein?: number,
                  sale?: number,
                  fat?: { unsaturated?: number, saturated?: number },
                  carbohydrates?: { complex?: number, sugar?: number }
              },
              ...
           }
         }]
      */
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
      isMobile: false,
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
    },
    isTableEmpty(){
      return this.table.length === 0 || this.table.every(item => item.value100 === 0)
    }
  },

  methods:{
    onResize({screenWidth}){
      this.isMobile = screenWidth <= 576
    },
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
      let nutrientsForIngredient = ingredients.map(ingredient =>
          ({
           quantity: ingredient.quantity || 0,
           nutrients: this.calc(ingredient.quantity || 0, ingredient.food.nutritional_values || {},  100)
          })
      )
      this.fillNutritionalTable(this.table, nutrientsForIngredient)
      this.$emit('input', this.table)
    },

    /* Listeners update */
    onUpdateFood(food){
      const index = this.ingredients.findIndex(i => i.food._id === food._id)
      if(index !== -1) {
        this.ingredients.splice(index, 1 , Object.assign(this.ingredients[index], {food}))
        this.makeTable(this.ingredients)
      }
    }
  },
  created() {
    this.table = this.convertObjToArray(this.value)
    if(this.ingredients.length > 0) this.makeTable(this.ingredients)

    this.$bus.$on('food:update', this.onUpdateFood.bind(this))
  },
  beforeDestroy() {
    this.$bus.$off('food:update', this.onUpdateFood.bind(this))
  }
}
</script>

<style scoped>

</style>
