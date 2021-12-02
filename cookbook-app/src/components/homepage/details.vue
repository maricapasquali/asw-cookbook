<template>
  <div>
    <b-button variant="link" @click="showDetails">Dettagli</b-button>
    <b-modal v-model="show" title="Dettagli" centered hide-footer @hide="hideDetails">
      <template>
        <b-skeleton-wrapper :loading="isNotLoaded">
          <template #loading>
            <b-container fluid>
              <b-row cols="1" cols-lg="4">
                <div class="details-component">
                  <p>Valori nutrizionali</p>
                  <b-skeleton-table :rows="6" :columns="2" :table-props="{ bordered: true, striped: true }"></b-skeleton-table>
                </div>

                <div class="details-component">
                  <p>Ingredienti</p>
                  <ingredient-list/>
                </div>

                <div class="details-component">
                  <p>Procedimento</p>
                  <b-card>
                    <b-skeleton animation="wave" width="85%"></b-skeleton>
                    <b-skeleton animation="wave" width="55%"></b-skeleton>
                    <b-skeleton animation="wave" width="70%"></b-skeleton>
                    <b-skeleton animation="wave" width="85%"></b-skeleton>
                    <b-skeleton animation="wave" width="55%"></b-skeleton>
                    <b-skeleton animation="wave" width="70%"></b-skeleton>
                  </b-card>
                </div>

                <div class="details-component">
                  <p>Note</p>
                  <b-card>
                    <b-skeleton animation="wave" width="85%"></b-skeleton>
                    <b-skeleton animation="wave" width="55%"></b-skeleton>
                    <b-skeleton animation="wave" width="70%"></b-skeleton>
                  </b-card>
                </div>
              </b-row>
            </b-container>
          </template>

          <b-container fluid>
            {{recipe.name}}
            <b-row cols="1" :cols-lg="areThereNotes? 4: 3">
              <div class="details-component">
                <p>Valori nutrizionali</p>
                <b-card>
                  <nutrients-table :ingredients="recipe.ingredients"/>
                </b-card>
              </div>

              <div class="details-component">
                <p>Ingredienti</p>
                <ingredient-list v-model="recipe.ingredients"/>
              </div>

              <div class="details-component">
                <p>Procedimento</p>
                <b-card>{{recipe.preparation}}</b-card>
              </div>

              <div class="details-component" v-if="areThereNotes">
                <p>Note</p>
                <b-card>{{recipe.note}}</b-card>
              </div>
            </b-row>
          </b-container>
        </b-skeleton-wrapper>
      </template>
    </b-modal>
  </div>
</template>

<script>
import {isEmpty} from "@services/utils"
export default {
  name: "recipe-details",
  props:{
    recipe: Object
  },
  data(){
    return {
      show: false,
    }
  },
  computed:{
    areThereNotes(){
      return this.recipe.note
    },
    isNotLoaded(){
      return isEmpty(this.recipe)
    }
  },
  methods:{
    showDetails(){
      this.show = true
    },
    hideDetails(){
      console.debug('Close details modal.')
    }
  }
}
</script>

<style scoped>
/deep/ .modal-dialog{
  max-width: 90vw;
}
div.details-component {
  padding: 10px;
}
</style>