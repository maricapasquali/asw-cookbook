<template>
  <b-skeleton-wrapper :loading="value.length===0">
    <template #loading>
      <b-list-group
        class="accordion"
        role="tablist"
      >
        <b-list-group-item
          v-for="ind in skeletons"
          :key="ind"
          v-b-toggle="ingredientId(ind)"
          role="tab"
        >
          <b-skeleton
            class="ingredient-quantity"
            animation="wave"
            width="85%"
          />
          <b-collapse
            :id="ingredientId(ind)"
            role="tabpanel"
            accordion="my-accordion"
          >
            <b-skeleton-table
              :rows="6"
              :columns="2"
              :table-props="{ bordered: true, striped: true }"
            />
          </b-collapse>
        </b-list-group-item>
      </b-list-group>
    </template>
    <b-list-group
      class="accordion"
      role="tablist"
    >
      <b-list-group-item
        v-for="(ingredient, ind) in value"
        :key="ingredient._id"
        role="tab"
      >
        <b-row
          align-h="between"
          align-v="center"
        >
          <b-col
            v-b-toggle="ingredientId(ind)"
            :cols="isSigned ? 9: 12"
            :sm="isSigned ? 10: 12"
          >
            <b-container>
              <b-row>
                <b-col> <span>{{ ingredient.food.name }}</span> </b-col>
                <b-col class="px-0 text-right">
                  <span>{{ ingredient.quantity }} g</span>
                </b-col>
              </b-row>
            </b-container>
          </b-col>
          <b-col
            v-if="isSigned"
            cols="3"
            sm="2"
            class="text-right"
          >
            <b-button
              v-if="isIncludedInShoppingList(ingredient.food)"
              variant="danger"
              title="Rimuovi alla lista della spesa"
              @click="removeAlimentFromShoppingList(ingredient.food._id)"
            >
              <font-awesome-icon icon="minus" />
            </b-button>
            <b-button
              v-else
              variant="primary"
              title="Aggiungi alla lista della spesa"
              @click="addOrUpdateInShoppingList(ingredient.food._id)"
            >
              <font-awesome-icon icon="plus" />
            </b-button>
          </b-col>
        </b-row>
        <b-collapse
          :id="ingredientId(ind)"
          :ref="collapsedIngredientId(ind)"
          role="tabpanel"
          accordion="my-accordion"
          @show="getIngredientNutritionalValues(ind)"
        >
          <nutrients-table v-model="nutritional_values" />
        </b-collapse>
      </b-list-group-item>
    </b-list-group>
  </b-skeleton-wrapper>
</template>

<script>
import {
    mapActions,
    mapGetters
} from "vuex"

export default {
    name: "IngredientList",
    props: {
        value: {
            type: Array,
            default() {
                return []
            }
        }
    },
    data() {
        return {
            skeletons: 7,
            nutritional_values: {}
        }
    },
    computed: {
        ...mapGetters({
            isSigned: "session/isSigned",
            isIncludedInShoppingList: "shopping-list/in",
            findCheckedPointShoppingList: "shopping-list/findCheckedPoint",
            findUnCheckedPointShoppingList: "shopping-list/findUnCheckedPoint"
        })
    },
    methods:{
        ...mapActions({
            addInShoppingList: "shopping-list/add-point",
            updatePointShoppingList: "shopping-list/update-point",
            removeFromShoppingList: "shopping-list/remove-point"
        }),

        addOrUpdateInShoppingList(alimentID) {
            let pointID = this.findCheckedPointShoppingList(alimentID)?._id
            if (pointID) {
                this.updatePointShoppingList({ pointID, checked: false })
                    .then(({ data }) => {
                        console.debug("Unchecked item of shopping list", JSON.stringify(data))
                        console.debug(this.$store.getters["shopping-list/list"])
                        this.$socket.emit("shopping-list:update", { _id: pointID, checked: false })
                    })
                    .catch(this.$store.$api.errorsHandler.shoppingList.updateShoppingListPoint)
            } else {
                this.addInShoppingList(alimentID)
                    .then(({ data }) => {
                        console.debug("New point = ", data)
                        console.debug("Add on shopping list: ", JSON.stringify(this.$store.getters["shopping-list/list"][0]))
                        console.debug(this.$store.getters["shopping-list/list"])
                        this.$socket.emit("shopping-list:add", data)
                    })
                    .catch(this.$store.$api.errorsHandler.shoppingList.createShoppingListPoint)
            }
        },
        removeAlimentFromShoppingList(alimentID) {
            let pointID = this.findUnCheckedPointShoppingList(alimentID)?._id
            if (pointID) {
                this.removeFromShoppingList(pointID)
                    .then(() => {
                        console.debug("Remove from shopping list : ", pointID)
                        console.debug(this.$store.getters["shopping-list/list"])
                        this.$socket.emit("shopping-list:remove", pointID)
                    })
                    .catch(this.$store.$api.errorsHandler.shoppingList.deleteShoppingListPoint)
            }
        },

        ingredientId(index) {
            return "ingredient-"+index
        },
        collapsedIngredientId(index) {
            return "collapsed"+this.ingredientId(index)
        },

        getIngredientNutritionalValues(index) {
            this.nutritional_values = this.value[index].food.nutritional_values
        }
    }
}
</script>

<style scoped>
.list-group-item {
  cursor: pointer;
}
</style>
