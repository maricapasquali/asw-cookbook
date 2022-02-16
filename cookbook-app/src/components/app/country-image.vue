<template>
  <div v-if="selected">
    <b-img :id="imgId" :width="width" :height="height" class="country-image" :src="selected.src"></b-img>
    <b-tooltip :target="imgId" triggers="hover">
      <p>{{selected.text}}</p>
    </b-tooltip>
  </div>
</template>

<script>
import {mapGetters} from "vuex";

export default {
  name: "country-image",
  props: {
    value: String,
    id: {
      type: String | Number,
      default: 'country-image'
    },
    width: {
      type: String,
      default: "40"
    },
    height: {
      type: String,
      default: "30"
    }
  },
  data(){
    return {
      selected: null
    }
  },
  watch: {
    value(val, old){
      this.select(val)
    }
  },
  computed: {
    ...mapGetters(['getCountryByValue']),
    imgId(){
      return  'country-image-'+ this.id
    }
  },
  methods: {
    select(val){
      this.selected = this.getCountryByValue(val)
    }
  },
  mounted() {
    this.select(this.value)
  }
}
</script>

<style scoped>
</style>