<template>
  <b-container fluid>
    <b-skeleton-wrapper :loading="processing">
      <template #loading>
        <b-card
          v-for="i in skeletons"
          :key="i"
          class="recipe-post p-0 mt-3 mx-auto col-lg-8"
        >
          <template #header>
            <b-row align-h="between">
              <b-col><b-skeleton width="30%" /></b-col>
              <b-col class="d-flex justify-content-end">
                <b-skeleton width="20%" />
              </b-col>
            </b-row>
          </template>
          <b-skeleton-img aspect="4:1" />
          <b-row
            class="description-post"
            align-h="between"
          >
            <b-col class="d-flex align-items-center pl-2">
              <b-skeleton width="50%" />
            </b-col>
            <b-col class="d-flex justify-content-end pr-1">
              <b-skeleton width="25%" />
            </b-col>

            <b-button
              variant="info"
              class="details-recipes"
              disabled
            >
              <b-icon-info-circle />
            </b-button>
          </b-row>

          <template #footer>
            <b-row align-h="between">
              <b-col>
                <b-skeleton-icon
                  icon="heart"
                  :icon-props="{ variant: 'light' }"
                />
              </b-col>
              <b-col class="text-right">
                <b-skeleton-icon
                  icon="chat"
                  :icon-props="{ variant: 'light' }"
                />
              </b-col>
            </b-row>
          </template>
        </b-card>
      </template>

      <b-container
        v-if="docs.length > 0"
        fluid
        class="recipe-post-container px-0"
      >
        <b-row
          v-show="newArrivals.toRead"
          class="new-recipes"
        >
          <b-col class="text-center">
            <b-button
              class="px-3"
              variant="light"
              @click="goToNewRecipes"
            >
              <b-icon-arrow-up-short />
              <span>{{ newArrivals.toRead }} nuove ricette</span>
            </b-button>
          </b-col>
        </b-row>

        <b-row
          v-scroll="onScrollWindow"
          cols="1"
          class="posts"
        >
          <b-col
            v-for="(doc, ind) in docs"
            :key="doc._id"
            class="mx-auto px-1 mb-3"
            cols="12"
            sm="10"
            md="9"
            lg="7"
          >
            <b-card class="recipe-post">
              <!-- Author and date -->
              <template #header>
                <b-row
                  align-h="between"
                  align-v="center"
                >
                  <b-col v-if="doc.owner">
                    <avatar
                      v-model="doc.owner.img"
                      :user-id="doc.owner.userID"
                      :user="doc.owner._id"
                      variant="light"
                      :size="30"
                      user-id-class="text-white"
                      link
                    />
                  </b-col>
                  <b-col class="text-right">
                    <elapsed-time
                      v-model="doc.createdAt"
                      :language="language"
                    />
                  </b-col>
                </b-row>
              </template>

              <!-- Image / Tutorial -->
              <preview-recipe-tutorial
                v-model="doc.tutorial"
                class="recipes-tutorial"
                :poster="doc.img"
                with-image
              />

              <!-- Description: name, country, category -->
              <b-row
                :class="{'description-post': true, 'py-2': !doc.country}"
                align-h="between"
              >
                <b-col class="d-flex align-items-center pl-2">
                  <router-link
                    :to="redirectToRecipe(doc)"
                    class="recipe-post-link"
                  >
                    {{ doc.name }}
                  </router-link>
                </b-col>
                <b-col class="d-flex justify-content-end pr-1">
                  <span class="d-flex align-items-center justify-content-center pr-2">  {{ doc.category.text }} </span>
                  <country-image
                    :id="doc._id"
                    v-model="doc.country"
                  />
                  <!-- Details -->
                  <recipe-details
                    :recipe="doc"
                    class="details-recipes"
                  />
                </b-col>
              </b-row>

              <!-- Likes and Comments -->
              <template #footer>
                <b-row
                  align-h="between"
                  align-v="center"
                >
                  <b-col>
                    <!-- Like of a RECIPE -->
                    <like
                      v-model="doc.likes"
                      :recipe="doc"
                      :no-like="youNotMakeLike(ind)"
                    />
                  </b-col>
                  <b-col class="text-right">
                    <b-icon-chat
                      v-b-toggle="commentsId(doc._id)"
                      class="icon"
                    />
                  </b-col>
                </b-row>
                <b-collapse
                  :id="commentsId(doc._id)"
                  class="mt-2"
                >
                  <!-- LIST COMMENT for a RECIPE -->
                  <comments
                    v-model="doc.comments"
                    :recipe="doc"
                  />
                </b-collapse>
              </template>
            </b-card>
          </b-col>
        </b-row>
        <b-row>
          <load-others
            :are-others="areOthers"
            :in-processing="loadOther"
            @load="others"
          />
        </b-row>
      </b-container>
      <b-container v-else>
        <b-card>
          <b-card-body class="text-center">
            <b-card-text class="welcome-text">
              Benvenuto su
            </b-card-text>
            <logo />
          </b-card-body>
        </b-card>
      </b-container>
    </b-skeleton-wrapper>
  </b-container>
</template>

<script>

import {
    PendingRequestMixin,
    UserMixin
} from "@mixins"
import { mapGetters } from "vuex"

export default {
    name: "HomePage",
    mixins: [UserMixin, PendingRequestMixin],
    data() {
        return {
            skeletons: 5,
            processing: true,

            newArrivals: {
                toRead: 0,
                total: 0
            },

            loadOther: false,

            docs: [],
            total: 0,
            optionsPagination: {
                page: 1,
                limit: 5
            }
        }
    },
    computed: {
        areOthers() {
            return this.docs.length > 0 && this.docs.length < this.total
        },

        ...mapGetters(["getRecipeCategoryByValue", "language"]),
        ...mapGetters({
            userIdentifier: "session/userIdentifier",
            isAdmin: "session/isAdmin"
        })
    },
    created() {
        this.$bus.$on("recipe:create", this.onNewRecipeListeners.bind(this))
        this.$bus.$on("recipe:update", this.onUpdatedRecipeListeners.bind(this))
        this.$bus.$on("recipe:delete", this.onDeletedRecipeListeners.bind(this))

        this.$bus.$on("user:update:info", this.onUpdateInfos.bind(this))
        this.$bus.$on("user:delete", this.onDeletedUserListeners.bind(this))

        this.getPost()
    },
    beforeDestroy() {
        this.$bus.$off("recipe:create", this.onNewRecipeListeners.bind(this))
        this.$bus.$off("recipe:update", this.onUpdatedRecipeListeners.bind(this))
        this.$bus.$off("recipe:delete", this.onDeletedRecipeListeners.bind(this))

        this.$bus.$off("user:update:info", this.onUpdateInfos.bind(this))
        this.$bus.$off("user:delete", this.onDeletedUserListeners.bind(this))
    },
    methods: {
        redirectToRecipe(rec) {
            return rec.owner ?  { name: "single-recipe", params: { id: rec.owner._id, recipeId: rec._id } } :
                { name: "recipe", params: { recipeId: rec._id } }
        },

        commentsId(id) {
            return "comments-"+ id
        },

        youNotMakeLike(index) {
            const owner = this.docs[index].owner
            return this.isAdmin || !owner || owner._id === this.userIdentifier
        },
        /* -- REQUEST --*/

        _remapRecipe(recipe) {
            let category = this.getRecipeCategoryByValue(recipe.category)
            recipe.category = category || { text: "" }
        },

        getPost(currentPage, _limit) {
            const page = currentPage || 1
            const limit = _limit || this.optionsPagination.limit

            console.debug("POST pagination: ", { page, limit })

            let _id = "all-shared"
            let options = this.makeRequestOptions(_id, { message: "homepage old recipes abort." })

            if (currentPage) this.loadOther = true

            this.$store.dispatch("recipes/all-shared", { pagination: { page, limit, skip: this.newArrivals.total }, options })
                .then(({ data }) => {

                    console.debug(data)
                    data.items.forEach(r => this._remapRecipe(r))
                    if (currentPage) this.docs.push(...data.items)
                    else this.docs = data.items

                    this.total = data.total
                    if (!_limit) this.optionsPagination.page = page
                })
                .catch(this.$store.$api.errorsHandler.recipes.allSharedRecipes)
                .then(() => {
                    if (currentPage) this.loadOther = false
                    this.pendingRequests.remove(_id)
                })
                .finally(() => this.processing = false)
        },
        others() {
            console.debug("Altri "+this.optionsPagination.limit+" ricette ...")
            this.getPost(this.optionsPagination.page + 1)
        },

        onScrollWindow({ toBottom, toTop }) {
            if (toTop) this.newArrivals.toRead = 0
            if (toBottom && this.loadOther === false && this.areOthers) this.others()
        },

        goToNewRecipes() {
            window.scrollTo({ top: 0, left: 0, behavior: "smooth" })
        },

        setNewArrivals() {
            this.newArrivals.total+=1
            if (document.documentElement.scrollTop > 0) this.newArrivals.toRead +=1
        },

        /* Listener notification */
        onUpdatedRecipeListeners(_, recipe) {
            if (recipe) {
                let index = this.docs.findIndex(r => r._id === recipe._id)
                if (index !== -1) {
                    this._remapRecipe(recipe)
                    this.docs.splice(index, 1, recipe)
                }
            }
        },
        onDeletedRecipeListeners(_, recipe) {
            if (recipe) this.getPost(0, this.optionsPagination.page * this.optionsPagination.limit)
        },

        onNewRecipeListeners(_, recipe) {
            if (recipe) {
                this._remapRecipe(recipe)
                this.docs.unshift(recipe)
                this.total+=1

                this.setNewArrivals()
            }
        },

        /* Listener update */
        onUpdateInfos(userInfo) {
            if (userInfo && (userInfo.information || userInfo.userID)) {
                this.docs.filter(recipe => recipe.owner && recipe.owner._id === userInfo._id)
                    .forEach(recipe => this._updateUserInformation(recipe.owner, userInfo))
            }
        },
        onDeletedUserListeners(id) {
            console.debug("on delete user => _id = ", id)
            this.docs.filter(recipe => recipe.owner && recipe.owner._id === id).forEach(recipe => recipe.owner = null)
        }
    }
}
</script>

<style lang="scss" scoped>
.welcome-text {
  font-size: 30pt;
  font-style: italic;
}

.recipe-post-container {
  .new-recipes {
    position: sticky;
    z-index: 100;
    top: 14%;
    left: 50%;
    margin-bottom: 15px;

    & button {
      border-radius: 1.25rem;
      box-shadow: 0 0 19px 5px #00000096;
      font-size: 15pt;
    }
  }
}

.description-post {
  position: absolute;
  background-color: $overlay;
  color: white;
  top: 10%;
  left: 15px;
  width: 100%;
}

.details-recipes {
  position: absolute;
  right: 5px;
  bottom: calc(100% - 75px);
}

.recipe-post {
  & > .card-header,
  .card-footer {
    color: white;
    background-color: $component-color;

    & a {
      color: white;
    }
  }

  & > .card-body {
    position: relative;
    padding: 0;
  }

  & .country-image {
    width: 50px;
    height: 40px;
  }

  & .recipe-post-link {
    color: white;
  }

  & .recipes-tutorial {
    height: 300px;
  }
}

</style>
