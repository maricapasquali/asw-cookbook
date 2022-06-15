<template>
  <b-container
    fluid
    class="recipes-section-item"
    role="tablist"
  >
    <!-- Recipe: BaseInfo + Actions -->
    <b-row
      class="ml-2"
      cols="1"
      cols-md="2"
    >
      <b-col class="mb-2">
        <b-row>
          <preview-recipe-image
            :value="item.recipe.img"
            class="col col-3 px-0"
          />
          <b-col class="ml-3">
            <b-row>
              <strong>
                <div v-if="isLoved && item.recipe.owner">
                  <router-link :to="{name: 'single-recipe', params: {id: item.recipe.owner._id, recipeId: item.recipe._id } }">{{ item.recipe.name }}</router-link>
                </div>
                <span v-else> {{ item.recipe.name }} </span>
              </strong>
            </b-row>
            <b-row v-if="noMyRecipe">
              <router-link :to="{name: 'single-user', params:{id: item.recipe.owner._id}}">
                {{ item.recipe.owner.userID }}
              </router-link>
            </b-row>
            <b-row><small> Data di creazione: {{ item.recipe.createdAt | date }}</small></b-row>
            <b-row><small> Data di ultima modifica: {{ item.recipe.updatedAt | date }}</small></b-row>

            <b-row
              v-show="item.recipe.shared && item.recipe.likes.length > 0"
              class="mt-1"
            >
              <like
                :value="item.recipe.likes"
                :recipe="item.recipe"
                variant="light"
                no-like
                @input="$set(item.recipe, 'likes', $event)"
              />
            </b-row>
          </b-col>
        </b-row>
      </b-col>
      <b-col class="text-right mb-2">
        <b-button-group>
          <b-button
            v-if="includeActionDetails"
            v-b-toggle="toggleDetailId"
            :title="toggleDetailTitle"
            variant="info"
          >
            <b-icon-info-circle />
          </b-button>

          <b-button
            v-if="includeActionChange"
            v-b-toggle="toggleChangeId"
            :title="toggleChangeTitle"
            variant="primary"
          >
            <b-icon-pencil-square />
          </b-button>

          <b-button
            v-if="includeActionDirectlyShared"
            title="Condividi senza modificare"
            variant="light"
            @click="onDirectlyShared"
          >
            <b-icon-share />
          </b-button>

          <b-button
            v-if="includeActionDirectlySaved"
            title="Duplicazione privata senza modificare"
            variant="light"
            @click="onDirectlySaved"
          >
            <b-icon-files />
          </b-button>

          <b-button
            v-if="includeActionDelete"
            title="Cancella"
            variant="danger"
            @click="onErase(false)"
          >
            <b-icon-trash-fill />
          </b-button>

          <b-button
            v-if="includeActionRemove"
            title="Rimuovi"
            variant="danger"
            @click="onErase(true)"
          >
            <b-icon-trash-fill />
          </b-button>
        </b-button-group>
      </b-col>
    </b-row>

    <!-- Details -->
    <b-collapse
      :id="toggleDetailId"
      :value="item.showDetails"
      accordion="actions"
      role="tabpanel"
      @input="$set(item, 'showDetails', $event)"
    >
      <b-card class="mt-3">
        <!-- Tutorial -->
        <b-row
          v-if="item.recipe.tutorial"
          class="tutorial mb-4"
          align-h="center"
        >
          <preview-recipe-tutorial
            :value="item.recipe.tutorial"
            class="col col-6"
            :poster="item.recipe.img"
            @onVideoNotFound="tutorialNotFound"
          />
        </b-row>

        <!-- Country, Diet & Category -->
        <b-row
          class="country-diet-category"
          cols="1"
          cols-sm="3"
        >
          <b-col v-if="item.recipe.diet && item.recipe.diet.value">
            <b-form-group
              label-for="r-d-diet"
              label="Regime alimentare"
            >
              <b-form-input
                id="r-d-diet"
                :value="item.recipe.diet.text"
                readonly
              />
            </b-form-group>
          </b-col>
          <b-col>
            <b-form-group
              label-for="r-d-category"
              label="Categoria"
            >
              <b-form-input
                id="r-d-category"
                :value="item.recipe.category.text"
                readonly
              />
            </b-form-group>
          </b-col>
          <b-col
            v-if="item.recipe.country"
            align-self="center"
            class="text-right"
          >
            <country-image
              :id="'country-'+item.recipe._id"
              :value="item.recipe.country"
              width="50"
              height="50"
            />
          </b-col>
        </b-row>

        <!-- Ingredients  & Table of Nutrients -->
        <b-row
          class="ingredients-nutrients"
          cols="1"
          cols-lg="2"
        >
          <b-col>
            <b-form-group
              label="Ingredienti"
              :label-for="'recipe-'+ item.recipe._id + '-ingredients'"
            >
              <ingredient-list
                :id="'recipe-'+item.recipe._id + '-ingredients'"
                :value="item.recipe.ingredients"
                @input="$set(item.recipe, 'ingredients', $event)"
              />
            </b-form-group>
          </b-col>
          <b-col>
            <nutrients-table :ingredients="item.recipe.ingredients" />
          </b-col>
        </b-row>
        <!-- Preparation & Notes -->
        <b-row
          class="preparation-notes"
          cols="1"
          :cols-lg="item.recipe.note? 2: 1"
        >
          <b-col>
            <b-form-group
              label-for="r-d-preparation"
              label="Preparazione"
            >
              <b-form-textarea
                id="r-d-preparation"
                readonly
                :value="item.recipe.preparation"
                rows="10"
                no-resize
              />
            </b-form-group>
          </b-col>
          <b-col v-if="item.recipe.note">
            <b-form-group
              label-for="r-d-notes"
              label="Note"
            >
              <b-form-textarea
                id="r-d-notes"
                readonly
                :value="item.recipe.note"
                rows="10"
                no-resize
              />
            </b-form-group>
          </b-col>
        </b-row>

        <!-- Permissions -->
        <b-row v-if="item.recipe.permission">
          <b-col>
            <permission-list
              :id="permissionId"
              :value="item.recipe.permission"
              @input="$set(item.recipe, 'permission', $event)"
            />
          </b-col>
        </b-row>

        <!-- Comments -->
        <b-row
          v-if="item.recipe.shared && item.recipe.comments.length>0"
          cols="1"
          class="comments mx-1 mt-2"
        >
          <b-col class="px-0">
            <strong>Commenti</strong>
          </b-col>
          <b-col class="px-0">
            <comments
              :value="item.recipe.comments"
              :recipe="item.recipe"
              @input="$set(item.recipe, 'comments', $event)"
            />
          </b-col>
        </b-row>
      </b-card>
    </b-collapse>

    <!-- Change recipe form -->
    <b-collapse
      :id="toggleChangeId"
      accordion="actions"
      role="tabpanel"
      @show="onShowChangeForm"
      @hide="onHideChangeForm"
    >
      <b-card
        v-if="updateForm.show"
        no-body
      >
        <recipe-form
          v-model="updateForm.recipe"
          title="Modifica ricetta"
          @onChanged="onChangedRecipe"
        />
      </b-card>
    </b-collapse>
  </b-container>
</template>

<script>
import { mapGetters } from "vuex"

import { UserMixin } from "@mixins"

export default {
    name: "RecipeTabItem",
    mixins: [UserMixin],
    props: {
        item: {
            type: Object,
            required: true,
            default() {
                return ({
                    recipe: {},
                    actions: [],
                    showDetails: false
                })
            }
        },
        position: {
            type: Number,
            required: true
        },
        mode: {
            type: String,
            default: "retrieve",
            enum: ["retrieve", "search-mode"]
        },
        selectedType: {
            type: String,
            default: ""
        },
    },
    data() {
        return {
            directShared: false,
            directSaved: false,
            deleteRecipe: false,

            updateForm: {
                show: false,
                recipe: null
            }
        }
    },
    computed: {
        ...mapGetters({
            userIdentifier: "session/userIdentifier",
        }),
        toggleDetailId() {
            return `${this.mode}-details-${this.item.recipe._id}`
        },
        toggleDetailTitle() {
            return (this.item.showDetails ? "Nascondi" : "Mostra") +  " Dettagli"
        },

        toggleChangeId() {
            return  `${this.mode}-change-mode-${this.item.recipe._id}`
        },
        toggleChangeTitle() {
            return (this.updateForm.show ? "Chiudi" : "Apri") +  " modifica ricetta"
        },

        permissionId() {
            return `permission-${this.item.recipe._id}`
        },

        includeActionDetails() {
            return this.item.actions.includes("details")
        },
        includeActionChange() {
            return this.item.actions.includes("change")
        },
        includeActionDirectlyShared() {
            return this.item.actions.includes("directly-shared")
        },
        includeActionDirectlySaved() {
            return this.item.actions.includes("directly-saved")
        },
        includeActionDelete() {
            return this.item.actions.includes("delete")
        },
        includeActionRemove() {
            return this.item.actions.includes("remove")
        },

        isLoved() {
            return this.selectedType === "loved"
        },

        noMyRecipe() {
            return this.item.recipe.owner && this.item.recipe.owner._id !== this.userIdentifier
        }
    },
    created() {
        this.$bus.$on("user:update:info", this.onUpdateInfos.bind(this))
        this.$bus.$on("user:delete", this.onDeletedUserListeners.bind(this))
    },

    beforeDestroy() {
        this.$bus.$off("user:update:info", this.onUpdateInfos.bind(this))
        this.$bus.$off("user:delete", this.onDeletedUserListeners.bind(this))
    },
    methods: {
        tutorialNotFound(e) {
            if (e && e.target) {
                console.error("tutorial ("+e.target.src+") not found")
                e.target.parentNode?.parentNode?.remove()
            }
        },

        /* - SAVED RECIPE: SHARE ONLY */
        onDirectlyShared() {
            this.$emit("onClickDirectlyShared", this.item.recipe, this.position)
        },
        /* - SHARED RECIPE: SAVE ONLY */
        onDirectlySaved() {
            this.$emit("onClickDirectlySaved", this.item.recipe,  this.position)
        },
        /* - DELETE OR REMOVE */
        onErase(loved) {
            this.$emit("onClickErase", this.item.recipe,  this.position, loved)
        },
        /* - CHANGE */
        onShowChangeForm() {
            this.updateForm = {
                recipe: clone(this.item.recipe),
                show: true
            }
        },
        onHideChangeForm() {
            this.updateForm = {
                show: false,
                recipe: null
            }
        },
        onChangedRecipe(cRecipe) {
            this.$emit("onChangedRecipe", cRecipe, this.position)
            this.onHideChangeForm()
        },
        /* Listeners update */
        onUpdateInfos(userInfo) {
            if (this.item.recipe.owner?._id === userInfo?._id) this._updateUserInformation(this.item.recipe.owner, userInfo)
        },
        onDeletedUserListeners(id) {
            if (this.item.recipe.owner?._id === id) {
                this.$set(this.item.recipe, "owner", null)
            }
        },
    }
}
</script>

<style scoped>
/* stylelint-disable no-empty-source */
</style>
