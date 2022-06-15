<template>
  <b-container
    fluid
    class="friend-item px-0"
  >
    <b-row
      align-v="center"
      class="m-2 p-2"
      cols="2"
      cols-sm="2"
      cols-md="3"
      @click="onAddNewChat"
    >
      <b-col
        cols="12"
        sm="12"
        md="10"
      >
        <avatar
          v-model="friend.user.img"
          :user="friend.user._id"
          :size="40"
          :user-id="friend.user.userID"
        />
      </b-col>
      <b-col
        cols="12"
        sm="12"
        md="2"
        class="text-right"
      >
        <country-image
          :id="friendCountryId"
          v-model="friend.user.country"
        />
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
export default {
    name: "ChatFriendItem",
    props: {
        value: {
            type: Object,
            required: true
        }
    },
    data() {
        return {
            friend: {}
        }
    },
    computed: {
        friendCountryId() {
            return "country-friend-" + this.friend.user?._id
        }
    },
    watch: {
        value(val) {
            this.friend = val
        },
    },
    created() {
        this.friend = this.value
    },
    methods: {
        onAddNewChat() {
            this.$emit("clickUser", this.friend.user)
        }
    }
}
</script>

<style lang="scss" scoped>
.friend-item {
  border: 1px solid lightgrey;
  cursor: pointer;
}
</style>
