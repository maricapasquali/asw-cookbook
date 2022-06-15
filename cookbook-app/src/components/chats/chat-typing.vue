<template>
  <div class="ml-1">
    <span
      v-for="(user, index) in users"
      :key="user._id"
    >
      <span v-if="user.typing">
        <strong>{{ user.userID | username }}</strong>
        <span> sta scrivendo </span>
        <b-icon-three-dots
          animation="cylon"
          class="pt-2"
        />
        <span v-if="index < users.length - 1">, </span>
      </span>
    </span>
  </div>
</template>

<script>
export default {
    name: "ChatTyping",
    props: {
        users: {
            type: Array,
            default() {
                return []
            }
        },
        group: Boolean
    }
}
</script>

<style scoped>

</style>
