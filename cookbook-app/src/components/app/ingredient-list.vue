<template>
  <b-skeleton-wrapper :loading="value.length===0">
    <template #loading>
      <b-list-group class="accordion" role="tablist">
        <b-list-group-item v-for="ind in skeletons" :key="ind" v-b-toggle="ingredientId(ind)" role="tab">
          <b-skeleton class="ingredient-quantity" animation="wave" width="85%"></b-skeleton>
          <b-collapse :id="ingredientId(ind)" role="tabpanel" accordion="my-accordion">
            <b-skeleton-table :rows="6" :columns="2" :table-props="{ bordered: true, striped: true }"></b-skeleton-table>
          </b-collapse>
        </b-list-group-item>
      </b-list-group>
    </template>
    <b-list-group class="accordion" role="tablist">
      <b-list-group-item v-for="(ingredient, ind) in value" :key="ingredient._id" v-b-toggle="ingredientId(ind)" role="tab">
        <b-row align-h="between">
          <b-col><p>{{ingredient.food.name}}</p></b-col>
          <b-col align="end"><p>{{ingredient.quantity}} g</p></b-col>
        </b-row>
        <b-collapse :id="ingredientId(ind)" :ref="collapsedIngredientId(ind)" role="tabpanel" accordion="my-accordion" @show="getIngredientNutritionalValues(ind)">
          <nutrients-table v-model="nutritional_values"/>
        </b-collapse>
      </b-list-group-item>
    </b-list-group>
  </b-skeleton-wrapper>
</template>

<script>
export default {
  name: "ingredient-list",
  props: {
    value: {
      type: Array,
      default(){
        return []
      }
    }
  },
  data(){
    return {
      skeletons: 7,
      nutritional_values: {}
    }
  },
  methods:{
    ingredientId(index){
      return 'ingredient-'+index
    },
    collapsedIngredientId(index){
      return 'collapsed'+this.ingredientId(index)
    },

    getIngredientNutritionalValues(index) {
      //REQUEST INGREDIENT NUTRITIONAL VALUES
      // let food = require('@assets/examples/foods.js').find(f => f._id === this.value[index].foodID)
      //if(food) this.nutritional_values = food.nutritional_values
      this.nutritional_values = this.value[index].food.nutritional_values
    }
  }
}
</script>

<style scoped lang="scss">
.list-group-item{
  cursor: pointer;
}
</style>