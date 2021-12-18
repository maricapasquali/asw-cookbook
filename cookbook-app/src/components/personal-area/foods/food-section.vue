<template>
  <b-container :fluid="isSigned" v-resize="onResize">
    <b-row cols="1" cols-sm="1" cols-md="1" :cols-lg="isSigned? 2: 1" class="mx-auto">

      <!-- Foods -->
      <b-col class="my-5">
        <b-row class="align" align-h="between" align-v="center">
          <b-col class="px-0"><h2 id="foods">Alimenti</h2></b-col>
          <b-col align="end" class="mb-2">
            <b-button-group>
              <b-button id="food-form-btn" @click="toggleFoodForm" :variant="showFormFood? 'danger': 'primary'" pill>
                <font-awesome-icon :icon="showFormFood ? 'times-circle': 'plus-circle'" class="icon"/>
              </b-button>
              <b-tooltip target="food-form-btn"> {{showFormFood ? 'Chiudi' : 'Aggiungi alimento'}}</b-tooltip>
            </b-button-group>
          </b-col>
        </b-row>

        <b-toast id="add-food-success" variant="success" toaster="b-toaster-top-center">
          Inserimento dell' alimento avvenuto correttamente.
        </b-toast>
        <b-toast id="change-food-success" variant="success" toaster="b-toaster-top-center">
          Modifica dell' alimento avvenuto correttamente.
        </b-toast>

        <b-card class="align mb-3" v-if="showFormFood">
          <b-toast id="duplicate-food" variant="warning" class="mx-auto" static no-auto-hide>
            Alimento già presente.
          </b-toast>
          <food-form @onSave="onSaveFood" @onDuplicateGenerate="onDuplicateGenerateFood"/>
        </b-card>

        <!-- View foods table & research -->
        <div class="align">
          <b-skeleton-table v-if="loadingFood"
                            :rows="pagination.for_page"
                            :columns="fieldsFoodsTable.length"
                            :table-props="{ bordered: true, striped: true }" />

          <div v-show="!loadingFood" >
            <!-- Search food for aliment name or/and barcode -->
            <b-container fluid class="search-food-container my-2 py-3">
              <b-row class="mb-2">
                <b-col><strong>Ricerca</strong></b-col>
              </b-row>
              <b-row cols="1" cols-sm="1" cols-md="2">
                <b-col class="pl-0" md="6">
                  <b-form-group class="align" label-for="find-food-with-start">
                    <b-input-group >
                      <template #prepend> <b-input-group-text><b-icon-search/></b-input-group-text> </template>
                      <b-form-input id="find-food-with-start" v-model.trim="filters.name" placeholder="Alimento" type="search"/>
                    </b-input-group>
                  </b-form-group>
                </b-col>
                <b-col class="pl-0" md="6">
                  <b-form-group class="align" label-for="find-food-with-barcode">
                    <b-input-group>
                      <template #prepend> <b-input-group-text><b-icon-search/></b-input-group-text> </template>
                      <b-form-input id="find-food-with-barcode" v-model.trim.number="filters.barcode" placeholder="Codice a barre" type="search"/>
                      <template #append>
                        <barcode-scanner no-manual @onFound="filters.barcode = $event" @onError="filters.barcode = ''" show/>
                      </template>
                    </b-input-group>
                  </b-form-group>
                </b-col>
                <b-col align="start">
                  <b-button id="reset-search-food" variant="secondary" @click="onResetSearch" v-if="thereIsFilters">
                    <font-awesome-icon icon="undo" />
                  </b-button>
                  <b-tooltip target="reset-search-food" v-if="thereIsFilters" >Reset ricerca</b-tooltip>
                </b-col>
              </b-row>
            </b-container>

            <!-- Table aliment  -->
            <b-table id="food-table" fixed responsive :stacked="isMobile"
                     :tbody-tr-class="rowClass"
                     ref="foodTable"
                     :filter="filters"
                     :current-page="pagination.currentPage"
                     :per-page="pagination.for_page"
                     :busy.sync="pagination.isBusy"
                     :fields="fieldsFoodsTable"
                     :items="getFoods"
                     @row-clicked="item => $set(item, '_showDetails', !item._showDetails)" show-empty>

              <template #table-busy>
                <div  class="text-center text-primary my-2">
                  <b-spinner class="align-middle"></b-spinner>
                  <strong class="ml-2">Caricamento...</strong>
                </div>
              </template>

              <template #empty>
                <div class="text-center text-primary my-2">
                  <strong class="ml-2">Non ci sono alimenti...</strong>
                </div>
              </template>
              <template #emptyfiltered>
                <div class="text-center text-primary my-2">
                  <strong class="ml-2">Non ci sono alimenti filtrati ...</strong>
                </div>
              </template>

              <template #cell(owner)="row">
                <span v-if="isItMine(row.item.details.owner)">{{ row.value }}</span>
                <router-link v-else :to="{name: 'single-user', params:{id: row.item.details.owner._id}}">{{ row.value  }}</router-link>
              </template>

              <template #row-details="row">

                <b-modal v-model="modifyFood[row.index].edit" title="Modifica ingrediente"  hide-footer>
                  <food-form v-model="modifyFood[row.index].food" @onSave="onChangeFood($event, row)" mode="update"/>
                </b-modal>

                <b-row class="mb-3 mx-1" align-v="center">
                  <b-col class="px-0" v-if="row.item.details.barcode">
                    <b-row cols="1" align-h="start">
                      <b-col align="start"> <strong>Codice a barre</strong> </b-col>
                      <b-col align="start"> {{row.item.details.barcode}}  </b-col>
                    </b-row>
                  </b-col>
                  <b-col v-if="isItMine(row.item.details.owner) || isAdmin" align="end" class="px-0">
                    <b-button-group >
                      <b-button :id="'change-food-'+row.index" v-if="row.item.actions.includes('change')" variant="primary" @click="openChangeModeFood(row)"> <b-icon-pencil-square /></b-button>
                      <b-tooltip :target="'change-food-'+row.index" v-if="row.item.actions.includes('change')"> Modifica <i>{{row.item.aliment}}</i></b-tooltip>
                      <!-- use modal to remove food -->
                      <b-button :id="'remove-food-'+row.index" v-if="row.item.actions.includes('remove')" variant="danger" @click="removeFood(row)"> <b-icon-trash-fill /></b-button>
                      <b-tooltip :target="'remove-food-'+row.index" v-if="row.item.actions.includes('remove')"> Cancella <i>{{row.item.aliment}}</i></b-tooltip>
                    </b-button-group>
                  </b-col>
                </b-row>
                <nutrients-table v-model="row.item.details.nutritional_values"/>
              </template>

            </b-table>
            <b-pagination v-model="pagination.currentPage"
                          :total-rows="pagination.totals"
                          :per-page="pagination.for_page"
                          align="fill"
                          aria-controls="food-table"  />
          </div>
        </div>
      </b-col>

      <!-- Shopping List -->
      <b-col id="shopping-list" class="my-5" v-if="isSigned">
        <h2 class="align">Lista della spesa</h2>
        <food-finder @found="addInShoppingList" id="finder-food" ref="foodFinder" />
        <b-skeleton-wrapper :loading="loadingSL">
          <template #loading>
            <b-list-group class="shopping-list align">
              <b-list-group-item v-for="ind in skeleton" :key="ind" >
                <b-row align-v="center">
                  <b-col cols="9" sm="9" md="8" lg="9">
                    <b-skeleton width="40%"></b-skeleton>
                  </b-col>
                  <b-col cols="3" sm="3" md="4" lg="3">
                    <b-skeleton type="button"/>
                  </b-col>
                </b-row>
              </b-list-group-item>
            </b-list-group>
          </template>

          <!-- SHOPPING LIST -->
          <b-list-group :class="classesShoppingList">
            <b-list-group-item v-for="(point, index) in shopping_list" :key="index" :id="point.food._id" class="py-0" variant="warning">
              <b-row align-v="center" align-h="between">
                <b-col @click="patchShoppingList(index, !point.checked)" class="py-3">
                  <div :class="{'food-checked': point.checked}"></div>
                  <span>{{point.food.name}}</span>
                </b-col>
                <b-col cols="3" cols-sm="1" align="end">
                  <b-button :id="'remove-food-' + index" variant="danger" @click="removeFromShoppingList(index)"><b-icon-trash-fill/></b-button>
                  <b-tooltip :target="'remove-food-' + index">Rimuovi alimento <br/> dalla lista della spesa</b-tooltip>
                </b-col>
              </b-row>
            </b-list-group-item>
          </b-list-group>

        </b-skeleton-wrapper>
      </b-col>

    </b-row>
  </b-container>
</template>

<script>
import {clone, dateFormat} from '@services/utils'

import api from '@api'
import {mapGetters} from "vuex";

export default {
  name: "food-section",
  data(){
    return {
      skeleton: 6,
      isMobile: false,

      /* Shopping list */
      loadingSL: true,
      shopping_list: [],
      foodSelected: '',

      /*Foods */
      loadingFood: true,
      showFormFood: false,

      modifyFood: [],
      //foods: [],

      pagination: {
        currentPage: 1,
        for_page: 3, //TODO: CHANGE IN 10
        totals: 0,
        isBusy: false
      },

      fieldsFoodsTable: [
        {
          key: 'aliment',
          label: 'Alimento'
        },
        {
          key: 'owner',
          label: 'Creatore',
          formatter: (value, key, item) => value === this.username ? 'io': value
        },
        {
          key: 'creationDate',
          label: 'Data di creazione',
          formatter: (value, key, item) => dateFormat(value)
        }
      ],

      /*food search*/
      filters: {
        name: '',
        barcode: ''
      }
    }
  },

  computed: {
    ...mapGetters(['accessToken', 'isSigned', 'isAdmin', 'userIdentifier', 'username']),

    classesShoppingList(){
      return {'shopping-list':true, 'align':true, 'scroll': this.isMobile }
    },

    thereIsFilters(){
      return this.filters.name.length || this.filters.barcode.length
    }
  },
  filters: {
    ownerName(value){
      return value === this.username ? 'io': value
    },
  },
  methods: {
    rowClass(item, type) {
      if (!item || type !== 'row') return ''
      if (item._showDetails) return 'table-primary'
    },
    onResize({screenWidth}){
      this.isMobile = screenWidth < 768
    },

    isItMine(owner){
      return this.userIdentifier === owner._id && this.username === owner.userID
    },

    // Shopping List
    addInShoppingList(food){
      console.debug(food)
      this.foodSelected = food._id
      let index = this.shopping_list.findIndex(point => point.food._id === this.foodSelected)
      if(index === -1) {

        let _food = {food: this.foodSelected, checked: false}
        api.shoppingList
           .createShoppingListPoint(this.userIdentifier, _food, this.accessToken)
           .then(({data})=>{
              console.debug('New point = ', data)
              // this.shopping_list.push(data)
              this.shopping_list.unshift(data)

              console.debug('Add on shopping list: ', JSON.stringify(this.shopping_list[0]))
           }).catch(err => {
            //TODO: HANDLER ERROR add element of SHOPPING LIST
              //no dovrebbe avvenire mai
              if(err.response && err.response.status === 409){
                let index = this.shopping_list.findIndex(point => point.food._id === this.foodSelected)
                this.patchShoppingList(index, false)
              }
              console.error(err.response)
           })
      }
      else if(this.shopping_list[index].checked) {
        this.patchShoppingList(index, false)
      }
    },
    patchShoppingList(index, checked){
      let point = this.shopping_list[index]
      api.shoppingList
         .updateShoppingListPoint(this.userIdentifier, point._id, { checked: checked } , this.accessToken)
         .then(({data}) => {
           point.checked = checked
           console.debug(`${checked ? 'Checked': 'Unchecked'} item of shopping list:`, JSON.stringify(point))
         }).catch(err => {
          //TODO: HANDLER ERROR patch element of SHOPPING LIST
            console.error(err)
         })
    },
    removeFromShoppingList(index){

      let point = this.shopping_list[index]
      api.shoppingList
         .deleteShoppingListPoint(this.userIdentifier, point._id, this.accessToken)
         .then(({data}) => {
            console.debug('Remove from shopping list: ', JSON.stringify(point))
            this.shopping_list.splice(index, 1)
         }).catch(err => {
            //todo: HANDLER ERROR remove element of SHOPPING LIST
            console.error(err)
         })
    },
    getShoppingList(){
      api.shoppingList
         .getShoppingList(this.userIdentifier, this.accessToken)
         .then(({data}) => {
            this.shopping_list = data
            this.loadingSL = false
         }).catch(err => {
            //todo: HANDLER ERROR GET SHOPPING LIST
            console.error(err)
         })
    },

    // Foods
    toggleFoodForm(){
      this.showFormFood = !this.showFormFood
    },

    remapping(food) {
      let operation = [];
      if( this.isItMine(food.owner) || this.isAdmin ) operation.push('change')
      // if( this.isAdmin ) operation.push('remove')
      return {
        aliment: food.name,
        creationDate: food.createdAt,
        owner: food.owner.userID,
        actions: operation,
        details: food,
      }
    },

    getFoods(ctx){
      console.debug('ctx = ', ctx);
      let {perPage, currentPage} = ctx || {}
      let forPage = perPage || this.pagination.for_page
      let page = currentPage || this.pagination.currentPage
      this.pagination.isBusy = true
      return api.foods
                .getFoods(this.accessToken, {page: page, limit: forPage, ...({...ctx.filter})})
                .then(({data}) =>{
                    console.debug('Foods = ',data.items, ', total = ', data.total)

                    let items = data.items.map(f => this.remapping(f))
                    this.pagination.totals = data.total

                    // this.foods = items

                    this.modifyFood = items.map(f =>
                        this.isItMine(f.details.owner) || this.isAdmin ?
                            ({edit: false, food: f.details}) :
                            ({edit: null, food: null})
                    )

                    return items
                 })
                .catch(err => {
                    console.error(err)
                    return []
                })
                .finally(() =>{
                    this.loadingFood = false
                    this.pagination.isBusy = false
                })
    },

    onDuplicateGenerateFood(){
      //toast warming
      this.$bvToast.show('duplicate-food')
    },
    onSaveFood(food){
      console.debug('Add food = ', food, ', current page = ', this.pagination.currentPage)
      this.showFormFood = false
      this.$bvToast.show('add-food-success')

      this.$refs.foodTable.refresh()
    },
    removeFood(){
      throw new Error('Remove food not implemented!')
    },
    openChangeModeFood(row){
      let old = this.modifyFood[row.index]
      old.edit = true
      old.food = clone(row.item.details)
      console.debug(this.$bvModal)
    },
    onChangeFood(food, row){
      this.modifyFood[row.index].edit = false

      let oldF = row.item
      oldF.aliment = food.name
      oldF.details.name = food.name
      oldF.details.barcode = food.barcode
      oldF.details.nutritional_values = food.nutritional_values
      this.$bvToast.show('change-food-success')
    },

    /*Search food */
    onResetSearch(){
      this.filters.name = ''
      this.filters.barcode = ''
    }
  },

  created() {
    if(this.isSigned) this.getShoppingList()
  },
}
</script>

<style lang="scss" scoped>
::v-deep #food-table > tbody > tr:not(.b-table-details) {
  cursor: pointer;
}

.scroll{
  overflow-y: auto;
  max-height: 350px;
}
.align{
  margin-left: 17px;
}

.shopping-list{
  & > div{
    cursor: pointer;
  }
  .food-checked {
    width: 100%;
    top: 29px;
    border-bottom: 2px solid black;
    position: absolute;

  }
}
.search-food-container{
  border: 1px solid lightgray;
  border-radius: 10px;
}

@media (max-width: 992px){
  .shopping-list{
    .food-checked {
      width: 110%;
    }
  }
}

@media (max-width: 576px){
  .shopping-list{
    .food-checked {
      width: 100%;
    }
  }
}

@media (max-width: 400px){
  .shopping-list{
    .food-checked {
      width: 90%;
    }
  }
}

</style>
