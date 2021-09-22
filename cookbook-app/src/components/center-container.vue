<template>
  <b-container fluid="sm">
    <b-row cols="1" align-v="center" class="vh-100">
      <slot name="content"></slot>
    </b-row>
  </b-container>
</template>

<script>
export default {
  name: "center-container"
}
</script>

<style scoped>

</style>