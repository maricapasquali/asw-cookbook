<template>
  <div>
    <!-- ADD FOODS --->
    <b-modal
      v-model="addFood.show"
      title="Nuovo alimento"
      hide-footer
    >
      <food-form
        v-model="addFood.food"
        mode="create"
        @onSave="onSaveFood"
        @onDuplicateGenerate="addFood.show=false"
      />
    </b-modal>

    <b-row
      align-v="center"
      class="mx-1"
    >
      <b-col
        :cols="foodAdder ? 10: 12"
        :sm="foodAdder ? 11: 12"
        :class="{'pr-0': !foodAdder}"
      >
        <b-form-group
          id="ingredient-group"
          label="Trova"
          label-for="find-ingredient"
          :class="{'with-barcode': barcodeSearch}"
        >
          <div v-outside="_hideDropdownOutSide">
            <b-input-group>
              <b-form-input
                id="find-ingredient"
                ref="find-ingredient"
                v-model="startWith"
                :disabled="disabled"
                placeholder="Ingrediente"
                type="search"
                autocomplete="off"
                @focus="_showDropdown"
                @input="findFoods"
              />
              <template #append>
                <barcode-scanner
                  :show="barcodeSearch"
                  @onFound="onDecode"
                  @onError="onError"
                />
              </template>
            </b-input-group>
            <div v-show="!hideDropdown && startWith.length>0">
              <b-list-group
                v-if="atLeastResult"
                class="find-foods"
              >
                <b-list-group-item
                  v-for="food in foods"
                  :key="food._id"
                  @click="onSelectFood(food)"
                >
                  <span> <strong>{{ food.name | limit(startWith.length) }}</strong>{{ food.name | startFrom(startWith.length) }} </span>
                </b-list-group-item>
              </b-list-group>
              <b-list-group
                v-else
                class="find-foods"
              >
                <b-list-group-item><strong>Nessun risultato ...</strong></b-list-group-item>
              </b-list-group>
            </div>
          </div>
        </b-form-group>
      </b-col>
      <b-col
        v-if="foodAdder"
        cols="2"
        sm="1"
        class="text-center pl-0 pr-3 mt-3"
      >
        <b-button
          title="Aggiungi alimento"
          variant="primary"
          @click="addFood.show = true"
        >
          <font-awesome-icon
            icon="plus"
            class="icon pb-1"
          />
        </b-button>
      </b-col>
    </b-row>
  </div>
</template>

<script>

import { mapGetters } from "vuex"

export default {
    name: "FoodFinder",
    filters: {
        limit(text, len) {
            return text.substring(0, len)
        },
        startFrom(text, ind) {
            return text.substring(ind)
        }
    },
    props: {
        barcodeSearch: {
            type: Boolean,
            default: false
        },
        foodAdder:{
            type: Boolean,
            default: false
        },
        disabled: Boolean
    },
    data() {
        return {
            addFood: {
                show: false,
                food: {},
            },

            hideDropdown: false,
            startWith: "",

            foods: []
        }
    },
    computed: {
        atLeastResult() {
            return this.foods.length > 0
        },
        ...mapGetters({ accessToken: "session/accessToken" }),

        isAccessibleArea() {
            return ["search"].includes(this.$route.name)
        }
    },
    methods: {
        _showDropdown() {
            this.hideDropdown = this.startWith.length === 0
        },
        _hideDropdownOutSide() {
            this.hideDropdown = true
        },

        /*barcode scan*/
        onDecode(barcodeNumber) {
            if (this.barcodeSearch) {
                console.debug("FoodFinder : On found = ", barcodeNumber)

                this.$store.dispatch("foods/filterByBarcode", barcodeNumber)
                    .then(({ data }) => {
                        console.debug(data)
                        if (data.total === 0) this.onError({ barcode: barcodeNumber, error: "not found" })
                        else this.$emit("found", data.items[0])
                    })
                    .catch(err => this.$store.$api.errorsHandler.foods.searchFood(err, { _forbiddenPage: !this.isAccessibleArea }))

            } else throw new Error("BarcodeSearch: Funzionalità non attivata.")

        },
        onError(e) {
            console.debug("FoodFinder : On Error = ", e)
            this.$emit("not-found", e)
            // barcode not found
            if (this.foodAdder) {
                this.addFood.show = true
                this.addFood.food.barcode = e.barcode
            }
        },
        /*endbarcode*/

        findFoods(_startWith) {
            if (_startWith.length === 0) {
                this.foods = []
            } else {
                this.$store.dispatch("foods/filterByName", _startWith)
                    .then(({ data }) => {
                        console.debug(data)
                        this.foods = data.items
                        this.hideDropdown = false
                    })
                    .catch(err => {
                        this.foods = []
                        this.$store.$api.errorsHandler.foods.searchFood(err, { _forbiddenPage: !this.isAccessibleArea })
                    })
            }
        },

        onSaveFood(food) {
            if (this.foodAdder) {
                this.$emit("found", food)
                this.addFood = { show: false, food: {} }
            } else throw new Error("FoodAdder: Funzionalità non attivata.")
        },

        onSelectFood(food) {
            this.$emit("found", food)
            this.startWith = ""
        },

        async getFood(foodID) {
            return await this.$store.dispatch("foods/findById", foodID)
                .then(({ data }) => data)
                .catch(err => {
                    this.$store.$api.errorsHandler.foods.getFood(err, { _forbiddenPage: !this.isAccessibleArea })
                    return { nutritional_values: {} }
                })
        },
    },

}
</script>

<style lang="scss" scoped>
#ingredient-group {
  position: relative;

  &.with-barcode {
    input {
      text-overflow: ellipsis;
    }
  }

  .find-foods {
    position: absolute;
    width: 100%;
    z-index: 1;
    overflow-y: auto;
    max-height: 100px;
    box-shadow: 0 8px 7px 0 grey;

    & > div {
      padding: 10px;
      cursor: default;

      &:hover {
        background-color: lightgray;
      }
    }
  }
}

</style>
