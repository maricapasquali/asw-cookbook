<template>
  <div>
    <b-icon-heart-fill v-if="makeLike" @click="onLike" class="icon mr-1"/>
    <b-icon-heart v-else  @click="onLike" class="icon mr-1"/>
    <span v-if="like>0">{{like}}</span>
  </div>
</template>

<script>
export default {
  name: "like",
  props: {
    value: Number | Array
  },
  watch:{
    value(val, old){
      // console.log(`Update model = ${old} -> ${val}`)
      this.makeLike = val - old === 1
      this.like = val
    },
    like(val, old){
      // console.log(`Update (local) model = ${old} -> ${val}`)
      this.makeLike = val - old === 1
    }
  },
  data(){
    return {
      makeLike: false,
      like: 0
    }
  },
  mounted() {
    this.like = Array.isArray(this.value) ? this.value.length : this.value
  },
  methods: {
    onLike(){
      if(this.makeLike) {
        this.like -= 1
        this.$emit('unlike')
      } else {
        this.like += 1
        this.$emit('like')
      }
      this.$emit('input', this.like)
    }
  }
}
</script>

<style scoped>

</style>