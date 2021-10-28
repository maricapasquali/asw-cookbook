<template>
  <b-table striped :items="getItems" :fields="fields"></b-table>
</template>

<script>
export default {
  name: "nutrients-table",
  props:{
    value: Array
  },
  data(){
    return {
      nutrients: require('@assets/nutrients.js'),
      entries: [],
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
    }
  },
  computed:{
    getItems(){
      return this.value.map(item => {
        item.nutrient_label = this.nutrients.find(n => n.value === item.nutrient).text;
        return item
      })
    }
  },
}
</script>

<style scoped>

</style>