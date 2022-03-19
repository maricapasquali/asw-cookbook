<template>
  <div v-resize="onResize">
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: "window-with-resize",
  props: {
    size: {
      type: String,
      required: true,
      enum: ["sm", "md", "lg", "xl"]
    }
  },
  data(){
    return {
      _maxWidth: 0,
      inBound: false
    }
  },
  watch: {
    size(val){
      this._width(val)
    }
  },
  methods: {
    _width(val){
      switch (val){
        case "sm":
          this.$data._maxWidth = 576
          break;
        case "md":
          this.$data._maxWidth = 768
          break;
        case "lg":
          this.$data._maxWidth = 992
          break;
        case "xl":
          this.$data._maxWidth = 1200
          break;
      }
    },

    onResize({screenWidth, windowWidth}){
      if(this.$data._maxWidth > 0) {
        this.inBound = screenWidth < this.$data._maxWidth || windowWidth < this.$data._maxWidth
        this.$emit('in-bound', this.inBound)
      }
    },
  },
  created() {
    this._width(this.size)
  }
}
</script>

<style scoped>

</style>