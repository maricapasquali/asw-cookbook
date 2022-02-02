<template>
  <error-handler v-model="_error" title="Forbidden" variant="danger">
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
  computed: {
    _error(){
      return  { status: 403, show: this.forbiddenError.show, message: this.message }
    },
    message(){
      switch (this.method){
        case 'get': return 'Non sei autorizzata/o ad accedere a questa/e risorsa/e.'
        case 'post': return 'Non sei autorizzata/o a creare questa/e risorsa/e.'
        case 'delete':return 'Non sei autorizzata/o a cancellare questa/e risorsa/e.'
      }
      if(['put', 'patch'].includes(this.method)) return 'Non sei autorizzata/o ad aggiornare questa/e risorsa/e.'
      return 'Non sei autorizzata/o ad accedere a questa/e area.'
    },
    method(){
      return this.$store.state.requestError.forbiddenError.method
    },
    forbiddenError: {
      get(){
        return this.$store.state.requestError.forbiddenError
      },
      set(val){
        this.$store.commit('showForbiddenError', {show: val})
      }
    }
  },
  methods: {
    goHomePage(){
      this.$router.replace({name: 'homepage'})
      this.forbiddenError = false
    }
  }
}
</script>

<style scoped>

</style>