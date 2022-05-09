<template>
  <b-container fluid class="friend-item px-0">
    <b-row align-v="center" class="m-2 p-2" @click="onAddNewChat" cols="2" cols-sm="2" cols-md="3">
      <b-col cols="12" sm="12" md="10" >
        <avatar v-model="friend.user.img" :user="friend.user._id" :size="40" :userID="friend.user.userID"/>
      </b-col>
      <b-col cols="12" sm="12" md="2" class="text-right">
        <country-image v-model="friend.user.country" :id="friendCountryId"/>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
export default {
  name: "chat-friend-item",
  props: {
    value: Object
  },
  data(){
    return {
      friend: {}
    }
  },
  watch: {
    value(val, old){
      this.friend = val
    },
  },
  computed: {
    friendCountryId(){
      return 'country-friend-' + this.friend.user?._id
    }
  },
  methods: {
    onAddNewChat(){
      this.$emit('clickUser', this.friend.user)
    }
  },
  created() {
    this.friend = this.value
  }
}
</script>

<style lang="scss" scoped>
.friend-item {
  border: 1px solid lightgrey;
  cursor: pointer;
}
</style>