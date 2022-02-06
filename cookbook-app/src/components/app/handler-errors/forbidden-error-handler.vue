<template>
  <error-handler v-model="_error" title="Forbidden" variant="danger" no-closable>
    <template #more-details>
      <div class="d-flex justify-content-end">
        <b-button variant="primary" @click="goHomePage">Torna alla HomePage</b-button>
      </div>
    </template>
  </error-handler>
</template>

<script>
import ErrorHandler from "./error-handler";
export default {
  name: "forbidden-error-handler",
  components: {ErrorHandler},
  props: {
    value: {
      show: Boolean,
      message: String
    }
  },
  computed: {
    _error(){
      return  { status: 403, show: this.value.show, message: this.message }
    },
    message(){
      switch (this.value.method){
        case 'get': return 'Non sei autorizzata/o ad accedere a questa/e risorsa/e.'
        case 'post': return 'Non sei autorizzata/o a creare questa/e risorsa/e.'
        case 'delete':return 'Non sei autorizzata/o a cancellare questa/e risorsa/e.'
      }
      if(['put', 'patch'].includes(this.method)) return 'Non sei autorizzata/o ad aggiornare questa/e risorsa/e.'
      return 'Non sei autorizzata/o ad accedere a questa/e area.'
    },
    method(){
      return this.value.method
    }
  },
  methods: {
    goHomePage(){
      this.$router.replace({name: 'homepage'})
      this.$emit('input', {show: false})
    }
  }
}
</script>

<style scoped>

</style>