<template>
  <modal-alert v-model="show" variant="danger">
    <template v-slot:msg>
      <p>NON SEI AUTORIZATO AD ACCEDERE A QUEST'AREA</p>
      <p><router-link :to="{name: 'homepage'}" replace><b-button variant="primary">Vai alla HomePage</b-button></router-link></p>
    </template>
  </modal-alert>
</template>

<script>
export default {
  name: "not-authorized-area",
  data: function (){
    return {
      show: true
    }
  }
}
</script>

<style scoped>
</style>