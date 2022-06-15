<template>
  <div v-if="selected">
    <b-img
      :id="imgId"
      :title="selected.text"
      :width="width"
      :height="height"
      class="country-image"
      :src="selected.src"
    />
  </div>
</template>

<script>
import { mapGetters } from "vuex"

import { Countries } from "@shared/assets"

export default {
    name: "CountryImage",
    props: {
        value: {
            type: String,
            required: true,
            validator(val) {
                return !!Countries.find(country => country.value === val)
            }
        },
        id: {
            type: [String, Number],
            default: "country-image"
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
    data() {
        return {
            selected: {}
        }
    },
    computed: {
        ...mapGetters(["getCountryByValue"]),
        imgId() {
            return  "country-image-"+ this.id
        }
    },
    watch: {
        value(val) {
            this.select(val)
        }
    },
    mounted() {
        this.select(this.value)
    },
    methods: {
        select(val) {
            let _selected = this.getCountryByValue(val)
            if (_selected?.value) this.selected = _selected
        }
    }
}
</script>

<style scoped>
</style>
