<template>
  <div  v-if="selected"  >
    <b-img :id="id" :width="width" :height="height" class="country-image" :src="selected.src"></b-img>
    <b-tooltip v-if="selected" :target="id" triggers="hover">
      <p>{{selected.text}}</p>
    </b-tooltip>
  </div>
</template>

<script>
import {Countries} from "@services/app";

export default {
  name: "country-image",
  props: {
    value: String,
    id: {
      type: String,
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
  mounted() {
    this.selected = Countries.find(this.value)
  }
}
</script>

<style scoped>
</style>