<template>
  <ul>
    <li v-for="(liker, ind) in mappedLike" :key="ind" v-if="liker.anonymous || liker.user">
      <router-link v-if="liker.user" :to="route(liker)">
        {{liker.user.userID}}
      </router-link>
      <p v-else-if="liker.anonymous">
        Anonimo
        <span v-if="liker.anonymous > 1">( x {{ liker.anonymous }} )</span>
      </p>
    </li>
  </ul>
</template>

<script>
export default {
  name: "liker-list",
  props: {
    value: {
      type: Array,
      required: true
    }
  },
  computed: {
    mappedLike(){
      return [ { anonymous: this.value.filter(l => !l.user).length }, ...this.value.filter(l => l.user) ]
    },
  },
  methods: {
    route(liker){
      return { name: 'single-user', params: { id: liker.user?._id } }
    },
  }
}
</script>

<style scoped>

</style>
