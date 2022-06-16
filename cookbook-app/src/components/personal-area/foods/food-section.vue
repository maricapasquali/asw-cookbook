<template>
  <b-container :fluid="isSigned">
    <b-row
      cols="1"
      cols-sm="1"
      cols-md="1"
      :cols-lg="isSigned? 2: 1"
      class="mx-auto"
    >
      <!-- Foods -->
      <b-col class="my-5">
        <b-row
          class="align"
          align-h="between"
          align-v="center"
        >
          <b-col class="px-0">
            <h2 id="foods">
              Alimenti
            </h2>
          </b-col>
          <b-col class="text-right mb-2">
            <b-button-group>
              <b-button
                :title="showFormFood ? 'Chiudi' : 'Aggiungi alimento'"
                :variant="showFormFood? 'danger': 'primary'"
                pill
                @click="toggleFoodForm"
              >
                <font-awesome-icon
                  :icon="showFormFood ? 'times-circle': 'plus-circle'"
                  class="icon"
                />
              </b-button>
            </b-button-group>
          </b-col>
        </b-row>

        <b-toast
          id="add-food-success"
          variant="success"
          toaster="b-toaster-top-center"
        >
          Inserimento dell' alimento avvenuto correttamente.
        </b-toast>
        <b-toast
          id="change-food-success"
          variant="success"
          toaster="b-toaster-top-center"
        >
          Modifica dell' alimento avvenuto correttamente.
        </b-toast>

        <b-card
          v-if="showFormFood"
          class="align mb-3"
        >
          <b-toast
            id="duplicate-food"
            variant="warning"
            class="mx-auto"
            static
            no-auto-hide
          >
            Alimento già presente.
          </b-toast>
          <food-form
            @onSave="onSaveFood"
            @onDuplicateGenerate="onDuplicateGenerateFood"
          />
        </b-card>

        <!-- View foods table & research -->
        <div class="align">
          <b-skeleton-table
            v-if="loadingFood"
            :rows="pagination.for_page"
            :columns="fieldsFoodsTable.length"
            :table-props="{ bordered: true, striped: true }"
          />

          <div v-show="!loadingFood">
            <!-- Search food for aliment name or/and barcode -->
            <b-container
              fluid
              class="search-food-container my-2 py-3"
            >
              <b-row class="mb-2">
                <b-col><strong>Ricerca</strong></b-col>
              </b-row>
              <b-row
                cols="1"
                cols-sm="1"
                cols-md="2"
              >
                <b-col
                  class="pl-0"
                  md="6"
                >
                  <b-form-group
                    class="align"
                    label-for="find-food-with-start"
                  >
                    <b-input-group>
                      <template #prepend>
                        <b-input-group-text><b-icon-search /></b-input-group-text>
                      </template>
                      <b-form-input
                        id="find-food-with-start"
                        v-model.trim="filters.name"
                        placeholder="Alimento"
                        type="search"
                      />
                    </b-input-group>
                  </b-form-group>
                </b-col>
                <b-col
                  class="pl-0"
                  md="6"
                >
                  <b-form-group
                    class="align"
                    label-for="find-food-with-barcode"
                  >
                    <b-input-group>
                      <template #prepend>
                        <b-input-group-text><b-icon-search /></b-input-group-text>
                      </template>
                      <b-form-input
                        id="find-food-with-barcode"
                        v-model.trim.number="filters.barcode"
                        placeholder="Codice a barre"
                        type="search"
                      />
                      <template #append>
                        <barcode-scanner
                          no-manual
                          show
                          @onFound="filters.barcode = $event"
                          @onError="filters.barcode = ''"
                        />
                      </template>
                    </b-input-group>
                  </b-form-group>
                </b-col>
                <b-col class="text-left">
                  <b-button
                    v-if="thereIsFilters"
                    title="Reset ricerca"
                    variant="secondary"
                    @click="onResetSearch"
                  >
                    <font-awesome-icon icon="undo" />
                  </b-button>
                </b-col>
              </b-row>
            </b-container>

            <!-- Table aliment  -->
            <window-with-resize
              size="md"
              @in-bound="stacked_=$event"
            >
              <b-table
                id="food-table"
                ref="foodTable"
                fixed
                responsive
                :stacked="stacked_"
                :tbody-tr-class="rowClass"
                :filter="filters"
                :current-page="pagination.currentPage"
                :per-page="pagination.for_page"
                :busy.sync="pagination.isBusy"
                :fields="fieldsFoodsTable"
                :items="getFoods"
                show-empty
                @context-changed="abortRequest"
                @row-clicked="item => $set(item, '_showDetails', !item._showDetails)"
              >
                <template #table-busy>
                  <div class="text-center text-primary my-2">
                    <b-spinner class="align-middle" />
                    <strong class="ml-2">Caricamento...</strong>
                  </div>
                </template>

                <template #empty>
                  <div class="text-center text-primary my-2">
                    <strong class="ml-2">Non ci sono alimenti </strong>
                  </div>
                </template>
                <template #emptyfiltered>
                  <div class="text-center text-primary my-2">
                    <strong class="ml-2">Non ci sono alimenti {{ searchIsOn ? 'filtrati' : '' }}</strong>
                  </div>
                </template>

                <template #cell(owner)="row">
                  <span v-if="!row.item.details.owner"> Utente cancellato </span>
                  <span v-else-if="isItMine(row.item.details.owner)">{{ row.value }}</span>
                  <router-link
                    v-else
                    :to="{name: 'single-user', params:{id: row.item.details.owner._id}}"
                  >
                    {{ row.value }}
                  </router-link>
                </template>

                <template #row-details="row">
                  <b-modal
                    v-model="modifyFood[row.index].edit"
                    title="Modifica ingrediente"
                    hide-footer
                  >
                    <food-form
                      v-model="modifyFood[row.index].food"
                      mode="update"
                      @onSave="onChangeFood($event, row)"
                    />
                  </b-modal>

                  <b-row
                    class="mb-3 mx-1"
                    align-v="center"
                  >
                    <b-col
                      v-if="row.item.details.barcode"
                      class="px-0"
                    >
                      <b-row
                        cols="1"
                        align-h="start"
                      >
                        <b-col class="text-left">
                          <strong>Codice a barre</strong>
                        </b-col>
                        <b-col class="text-left">
                          {{ row.item.details.barcode }}
                        </b-col>
                      </b-row>
                    </b-col>
                    <b-col
                      v-if="isItMine(row.item.details.owner) || isAdmin"
                      class="text-right px-0"
                    >
                      <b-button-group>
                        <b-button
                          v-if="row.item.actions.includes('change')"
                          :title="'Modifica '+row.item.aliment"
                          variant="primary"
                          @click="openChangeModeFood(row)"
                        >
                          <b-icon-pencil-square />
                        </b-button>
                        <!-- use modal to remove food -->
                        <b-button
                          v-if="row.item.actions.includes('remove')"
                          :title="'Cancella '+row.item.aliment"
                          variant="danger"
                          @click="removeFood(row)"
                        >
                          <b-icon-trash-fill />
                        </b-button>
                      </b-button-group>
                    </b-col>
                  </b-row>
                  <nutrients-table v-model="row.item.details.nutritional_values" />
                </template>
              </b-table>
            </window-with-resize>
            <b-pagination
              v-model="pagination.currentPage"
              :total-rows="pagination.totals"
              :per-page="pagination.for_page"
              align="fill"
              aria-controls="food-table"
            />
          </div>
        </div>
      </b-col>

      <!-- Shopping List -->
      <b-col
        v-if="isSigned"
        id="shopping-list"
        class="my-5"
      >
        <h2 class="align">
          Lista della spesa
        </h2>
        <food-finder
          id="finder-food"
          ref="foodFinder"
          @found="addInShoppingList"
        />
        <b-skeleton-wrapper :loading="loadingSL">
          <template #loading>
            <b-list-group class="shopping-list align">
              <b-list-group-item
                v-for="ind in skeleton"
                :key="ind"
              >
                <b-row align-v="center">
                  <b-col
                    cols="9"
                    sm="9"
                    md="8"
                    lg="9"
                  >
                    <b-skeleton width="40%" />
                  </b-col>
                  <b-col
                    cols="3"
                    sm="3"
                    md="4"
                    lg="3"
                  >
                    <b-skeleton type="button" />
                  </b-col>
                </b-row>
              </b-list-group-item>
            </b-list-group>
          </template>

          <!-- SHOPPING LIST -->
          <b-list-group :class="classesShoppingList">
            <b-list-group-item
              v-for="(point, index) in shopping_list"
              :id="point.food._id"
              :key="index"
              class="py-0"
              variant="warning"
            >
              <b-row
                align-v="center"
                align-h="between"
              >
                <b-col
                  class="py-3"
                  @click="patchShoppingList(index, !point.checked)"
                >
                  <div :class="{'food-checked': point.checked}" />
                  <span>{{ point.food.name }}</span>
                </b-col>
                <b-col
                  cols="3"
                  cols-sm="1"
                  class="text-right"
                >
                  <b-button
                    title="Rimuovi dalla lista"
                    variant="danger"
                    @click="removeFromShoppingList(index)"
                  >
                    <b-icon-trash-fill />
                  </b-button>
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

import { mapGetters } from "vuex"
import { PendingRequestMixin } from "@mixins"

export default {
    name: "FoodSection",
    filters: {
        ownerName(value) {
            return value === this.username ? "io": value
        },
    },
    mixins: [PendingRequestMixin],
    data() {
        return {
            skeleton: 6,
            stacked_: false,

            idRequest: "foods-all",
            /* Shopping list */
            loadingSL: true,
            foodSelected: "",

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
                    key: "aliment",
                    label: "Alimento"
                },
                {
                    key: "owner",
                    label: "Creatore",
                    formatter: (value, key, item) => value === this.username ? "io" : (item.details.owner?.role === "admin" ? value + " (Amministratore)" : value)
                },
                {
                    key: "creationDate",
                    label: "Data di creazione",
                    formatter: value => dateFormat(value)
                }
            ],

            /*food search*/
            filters: {
                name: "",
                barcode: ""
            }
        }
    },

    computed: {
        ...mapGetters({
            isSigned: "session/isSigned",
            isAdmin: "session/isAdmin",
            userIdentifier: "session/userIdentifier",
            username: "session/username",
            shopping_list: "shopping-list/list"
        }),

        searchIsOn() {
            return this.filters.barcode || this.filters.name
        },

        classesShoppingList() {
            return { "shopping-list":true, "align":true, "scroll": this.stacked_ }
        },

        thereIsFilters() {
            return this.filters.name.length || this.filters.barcode.length
        }
    },
    created() {
        if (this.isSigned) this.getShoppingList()

        this.$bus.$on("food:create", this.onCreateFood.bind(this))
        this.$bus.$on("food:update", this.onUpdateFood.bind(this))


        this.$bus.$on("user:update:info", this.onUpdateInfos.bind(this))
        this.$bus.$on("user:delete", this.onDeletedUserListeners.bind(this))
    },
    beforeDestroy() {
        this.$bus.$off("food:create", this.onCreateFood.bind(this))
        this.$bus.$off("food:update", this.onUpdateFood.bind(this))

        this.$bus.$off("user:update:info", this.onUpdateInfos.bind(this))
        this.$bus.$off("user:delete", this.onDeletedUserListeners.bind(this))

        console.debug("Destroy food section...")
    },
    methods: {
        rowClass(item, type) {
            if (!item || type !== "row") return ""
            if (item._showDetails) return "table-primary"
        },

        isItMine(owner) {
            return owner && this.userIdentifier === owner._id && this.username === owner.userID
        },

        // Shopping List
        addInShoppingList(food) {
            console.debug(food)
            this.foodSelected = food._id
            const index = this.shopping_list.findIndex(point => point.food._id === this.foodSelected)
            if (index === -1) {
                this.$store.dispatch("shopping-list/add-point", this.foodSelected)
                    .then(({ data }) => {
                        console.debug("New point = ", data)
                        console.debug("Add on shopping list: ", JSON.stringify(this.shopping_list[0]))
                        console.debug(this.shopping_list)
                        this.$socket.emit("shopping-list:add", data)
                    })
                    .catch(this.$store.$api.errorsHandler.shoppingList.createShoppingListPoint)
                    .then(duplicate => {
                        if (duplicate && index !== -1) this.patchShoppingList(index, false)
                    })
            } else if (this.shopping_list[index].checked) {
                this.patchShoppingList(index, false)
            }
        },
        patchShoppingList(index, checked) {
            let point = this.shopping_list[index]
            this.$store.dispatch("shopping-list/update-point", { pointID: point._id, checked })
                .then(() => {
                    console.debug(`${checked ? "Checked": "Unchecked"} item of shopping list:`, JSON.stringify(point))
                    console.debug(this.shopping_list)
                    this.$socket.emit("shopping-list:update", point)
                })
                .catch(this.$store.$api.errorsHandler.shoppingList.updateShoppingListPoint)
        },
        removeFromShoppingList(index) {
            let point = this.shopping_list[index]
            this.$store.dispatch("shopping-list/remove-point", point._id)
                .then(() => {
                    console.debug("Remove from shopping list : ", JSON.stringify(point))
                    console.debug(this.shopping_list)
                    this.$socket.emit("shopping-list:remove", point._id)
                })
                .catch(this.$store.$api.errorsHandler.shoppingList.deleteShoppingListPoint)
        },
        getShoppingList() {
            if (this.shopping_list.length > 0) this.loadingSL = false
            else
                this.$store.dispatch("shopping-list/get")
                    .then(() => this.loadingSL = false)
                    .catch(this.$store.$api.errorsHandler.shoppingList.getShoppingList)
        },

        // Foods
        toggleFoodForm() {
            this.showFormFood = !this.showFormFood
        },

        remapping(food) {
            let operation = []
            if ( this.isItMine(food.owner) || this.isAdmin ) operation.push("change")
            // if( this.isAdmin ) operation.push('remove')
            return {
                aliment: food.name,
                creationDate: food.createdAt,
                owner:  food.owner && food.owner.userID,
                actions: operation,
                details: food,
            }
        },
        abortRequest() {
            this.pendingRequests.cancel(this.idRequest, "search food abort.")
        },
        getFoods(ctx) {
            let options = this.makeRequestOptions(this.idRequest)

            console.debug("ctx = ", ctx)
            let { perPage, currentPage } = ctx || {}
            let forPage = perPage || this.pagination.for_page
            let page = currentPage || this.pagination.currentPage
            this.pagination.isBusy = true
            return this.$store.dispatch("foods/all", { query: ctx.filter, pagination: { page: page, limit: forPage }, options })
                .then(({ data }) => {
                    console.debug("Foods = ",data.items, ", total = ", data.total)

                    let items = data.items.map(f => this.remapping(f))
                    this.pagination.totals = data.total

                    // this.foods = items

                    this.modifyFood = items.map(f =>
                        this.isItMine(f.details.owner) || this.isAdmin ?
                            ({ edit: false, food: f.details }) :
                            ({ edit: null, food: null })
                    )

                    return items
                })
                .catch(err => {
                    this.$store.$api.errorsHandler.foods.getFoods(err)
                    return []
                })
                .finally(() => {
                    this.loadingFood = false
                    this.pagination.isBusy = false
                    this.pendingRequests.remove(this.idRequest)
                })
        },

        onDuplicateGenerateFood() {
            //toast warming
            this.$bvToast.show("duplicate-food")
        },
        onSaveFood(food) {
            console.debug("Add food = ", food, ", current page = ", this.pagination.currentPage)
            this.showFormFood = false
            this.$bvToast.show("add-food-success")

            this.$refs.foodTable.refresh()
        },
        removeFood() {
            throw new Error("Remove food not implemented!")
        },
        openChangeModeFood(row) {
            let old = this.modifyFood[row.index]
            old.edit = true
            old.food = clone(row.item.details)
            console.debug(this.$bvModal)
        },
        onChangeFood(food, row) {
            this.modifyFood[row.index].edit = false

            let oldF = row.item
            oldF.aliment = food.name
            oldF.details.name = food.name
            oldF.details.barcode = food.barcode
            oldF.details.nutritional_values = food.nutritional_values
            this.$bvToast.show("change-food-success")
        },

        /*Search food */
        onResetSearch() {
            this.filters.name = ""
            this.filters.barcode = ""
        },

        /* Listeners notification */
        onCreateFood() {
            let table = this.$refs.foodTable
            table && table.refresh()
        },

        /* Listeners update */
        onUpdateFood(food) {
            let _food = this.$refs.foodTable.localItems.find(f => f.details._id === food._id)
            let index = this.$refs.foodTable.localItems.indexOf(_food)
            if (index !== -1) {
                this.$refs.foodTable.localItems.splice(index, 1, this.remapping(food))
                this.$set(this.$refs.foodTable.localItems[index], "_showDetails", _food._showDetails)
            }
        },

        onUpdateInfos(userInfo) {
            if (userInfo && userInfo.userID) {
                const table = this.$refs.foodTable
                table && table.localItems
                    .filter(item => item.details.owner._id === userInfo._id && userInfo.userID !== item.owner)
                    .forEach(food => {
                        food.owner = userInfo.userID
                        food.details.owner.userID = userInfo.userID
                    })
            }
        },
        onDeletedUserListeners(id) {
            const table = this.$refs.foodTable
            table && table.localItems
                .filter(item => item.details.owner._id === id)
                .forEach(food => {
                    food.owner = null
                    food.details.owner = null
                })
        }

    }
}
</script>

<style lang="scss" scoped>
::v-deep #food-table > tbody > tr:not(.b-table-details) {
  cursor: pointer;
}

.scroll {
  overflow-y: auto;
  max-height: 350px;
}

.align {
  margin-left: 17px;
}

.shopping-list {
  & > div {
    cursor: pointer;
  }

  .food-checked {
    width: 100%;
    top: 29px;
    border-bottom: 2px solid black;
    position: absolute;
  }
}

.search-food-container {
  border: 1px solid lightgray;
  border-radius: 10px;
}

@media screen and (max-width: $screen-large) {
  .shopping-list {
    .food-checked {
      width: 110%;
    }
  }
}

@media screen and (max-width: $screen-small) {
  .shopping-list {
    .food-checked {
      width: 100%;
    }
  }
}

@media screen and (max-width: $screen-extra-small) {
  .shopping-list {
    .food-checked {
      width: 90%;
    }
  }
}

</style>
