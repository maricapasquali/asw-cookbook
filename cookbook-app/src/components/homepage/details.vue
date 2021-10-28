<template>
  <div>
    <b-button variant="link" @click="showDetails">Dettagli</b-button>
    <b-modal v-model="show" title="Dettagli" centered hide-footer @hide="reset">
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
            <b-row cols="1" :cols-lg="areThereNotes? 4: 3">
              <div class="details-component">
                <p>Valori nutrizionali</p>
                <b-card>
                  <nutrients-table v-model="doc.nutritional_values"/>
                </b-card>
              </div>

              <div class="details-component">
                <p>Ingredienti</p>
                <ingredient-list v-model="doc.ingredients"/>
              </div>

              <div class="details-component">
                <p>Procedimento</p>
                <b-card>{{doc.process}}</b-card>
              </div>

              <div class="details-component" v-if="areThereNotes">
                <p>Note</p>
                <b-card>{{doc.notes}}</b-card>
              </div>
            </b-row>
          </b-container>
        </b-skeleton-wrapper>
      </template>
    </b-modal>
  </div>
</template>

<script>
import Utils from "@services/utils"
export default {
  name: "recipe-details",
  props:{
    recipeID: String
  },
  data(){
    return {
      show: false,
      doc: {}
    }
  },
  computed:{
    areThereNotes(){
      return this.doc.notes && this.doc.notes.length>0
    },
    isNotLoaded(){
      return Utils.isEmpty(this.doc)
    }
  },
  methods:{
    showDetails(){
      this.show = true
      this.getDetails()
      // setTimeout(this.getDetails.bind(this), 5000)
    },

    reset(){
      console.log("Reset...")
      this.doc = {}
    },

    getDetails(){
      console.log("Dettagli!!")
      // TODO: REQUEST DETAILS RECIPES
      this.doc = {
        nutritional_values: [
          {nutrient: 'energy', value100: 128},
          {nutrient: 'protein', value100: 13},
          {nutrient: 'fat', value100: 9},
          {nutrient: 'saturated_fat', value100: 9},
          {nutrient: 'carbohydrates', value100: 1},
          {nutrient: 'sugar', value100: 0},
        ],
        process: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
        notes: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",

        ingredients: [{foodId: '1', name: 'uova', quantity: 101}, {foodId: '22', name: 'farina 00', quantity: 300}, {foodId: '2', name: "olio d'oliva", quantity: 5}, {foodId: '3', name: 'latte intero', quantity: 200}]
      }

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