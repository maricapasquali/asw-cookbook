<template>
  <b-img v-if="$data._logo" :style="cssStyle" class="logo" fluid :src="$data._logo" :alt="$appName" @error="imgNotFound"/>
  <h2 v-else :class="dark ?'text-light': 'text-primary'"><em>{{ $appName }}</em></h2>
</template>

<script>
export default {
  name: "logo",
  props: {
    dark: Boolean,
    height: Number
  },
  data() {
    return {
      _logo: ""
    }
  },
  computed: {
    cssStyle(){
      let _css = {}
      if(this.height) _css.height = this.height + 'px!important'
      return _css
    }
  },
  watch: {
    dark(val){
      this.setLogo(val)
    }
  },
  methods: {
    setLogo(_dark){
      try {
        this.$data._logo = `/images/logo/${_dark ? "dark": "light"}-logo.png`
      } catch (e) {
        this.imgNotFound()
      }
    },
    imgNotFound(e){
      console.error(e)
      this.$data._logo = ""
    }
  },
  created() {
   this.setLogo(this.dark)
  }
}
</script>

<style scoped>
</style>
