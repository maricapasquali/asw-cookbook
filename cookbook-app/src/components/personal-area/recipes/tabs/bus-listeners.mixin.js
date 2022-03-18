import {mapGetters} from "vuex";
import RecipeMixin from "@components/mixins/recipe.mixin"

/**
 * Depend on recipes-tab-content
 */
export default {
    mixins: [RecipeMixin],
    computed: {
      ...mapGetters({
          userIdentifier: "session/userIdentifier"
      })
    },
    methods: {

        _findRecipe(id){
            let finder = i => i.recipe._id === id
            return (this.$data._recipes.find(finder) || this.searching.result.find(finder))?.recipe
        },

        onAddRecipePermission(recipe){
            if(recipe){
                if(recipe.owner?._id === this.userIdentifier) {
                    this._updateRecipeListener(recipe.shared ? "shared": "saved", recipe)
                }
                else if(recipe.permission?.find(p => p.user?._id === this.userIdentifier)){
                    if(this.isActive) {
                        if(this._findRecipe(recipe._id)) {
                            this._updateRecipe(recipe)
                            this._updateRecipeInSearchMode(recipe)
                        }
                        else {
                            this._prependRecipe(recipe)
                            this._prependRecipeInSearchMode(recipe)
                        }
                    }
                    else this.$emit("onShareInChat", recipe)
                }
            }
        },
        onMyLikeRecipeListeners(notification, like){
            let {recipe} = notification.otherInfo
            console.warn('Like ', like,' recipe ', recipe)
            if(like.user._id === this.userIdentifier) {
                console.warn('Retrieve recipe ')
                this.$store.dispatch("recipes/one-shared", { ownerID: recipe.owner, recipeID: recipe._id })
                    .then(({data}) => {
                        this.setDefaultValueOn(data)
                        if(this.isActive) {
                            this._prependRecipe(data)
                            this._prependRecipeInSearchMode(data)
                        }
                        else this.$emit("onLikeRecipe", data)
                    })
                    .catch(err => this.handleRequestErrors.recipes.getRecipe(err, {_forbiddenPage: true}))
            }
        },
        onMyUnLikeRecipeListeners(recipeID, likeID){
            if(this.isActive) {
                this._removeRecipe(recipeID)
                this._removeRecipeInSearchMode(recipeID)
            }
            else this.$emit("onUnLikeRecipe", recipeID, likeID)
        },

        _createNewRecipe(tabName, recipe){
            console.debug('Tab name '+tabName+' is active = ', this.isActive)
            if(this.selectedType === tabName && this.isActive) {
                this._prependRecipe(recipe)
                this._prependRecipeInSearchMode(recipe)
            }
            else {
                let event = tabName === "saved" ? "onClickReSaved":
                            tabName === "shared" ? "onClickShared" : undefined
                if(event) this.$emit(event, recipe)
            }
        },
        onSaveRecipeListeners(_, recipe){ //create a saved recipe
            this._createNewRecipe("saved", recipe)
        },
        onShareRecipeListeners(_, recipe){ //create a shared recipe
            this._createNewRecipe("shared", recipe)
        },

        _updateRecipeListener(tabName, recipe){
            console.debug('Tab name '+tabName+' is active = ', this.isActive)
            if(this.selectedType === tabName && this.isActive) {
                this._updateRecipe(recipe)
                this._updateRecipeInSearchMode(recipe)
            }
            else this.$emit("onUpdateRecipe", tabName, recipe)
        },
        onUpdatedRecipeListeners(_, recipe){
            if(recipe){
                let isMyRecipe = recipe.owner?._id === this.userIdentifier

                //shared and saved
                if(isMyRecipe && recipe.shared === true){
                    let old = this._findRecipe(recipe._id)
                    if(old) {
                        if(old.shared === false) this._deleteRecipeInTab('saved', old._id)
                        else this._updateRecipeListener("shared", recipe)
                    }
                }
                //saved
                if(isMyRecipe && recipe.shared === false)
                    this._updateRecipeListener("saved", recipe)

                // loved
                if(recipe.likes.find(i => i.user?._id === this.userIdentifier))
                    this._updateRecipeListener("loved", recipe)

                // shared-in-chat
                if(recipe.permission?.find(i => i.user._id === this.userIdentifier))
                    this._updateRecipeListener("shared-in-chat", recipe)
            }
        },

        _deleteRecipeInTab(tabName, recipeID){
            console.debug('Tab name ', tabName, ' is active = ', this.isActive)
            if(this.selectedType === tabName && this.isActive) {
                this._removeRecipe(recipeID)
                this._removeRecipeInSearchMode(recipeID)
            }
            else this.$emit('onDeleteRecipe', tabName, recipeID)
        },
        onDeletedRecipeListeners(notification, _){
            let {recipe} = notification.otherInfo
            if(recipe){
                let isMyRecipe = recipe.owner?._id === this.userIdentifier

                //shared
                if(isMyRecipe && recipe.shared === true)
                    this._deleteRecipeInTab("shared", recipe._id)
                //saved
                if(isMyRecipe && recipe.shared === false)
                    this._deleteRecipeInTab("saved", recipe._id)

                // loved
                if(recipe.likes.find(i => i.user?._id === this.userIdentifier))
                    this._deleteRecipeInTab("loved", recipe._id)

                // shared-in-chat
                if(recipe.permission?.find(i => i.user._id === this.userIdentifier))
                    this._deleteRecipeInTab("shared-in-chat", recipe._id)
            }
        },
    },
    created(){
        this.$bus.$on('recipe:add:permission', this.onAddRecipePermission.bind(this))

        if(this.isLovedTab){
            this.$bus.$on('like:recipe', this.onMyLikeRecipeListeners.bind(this))
            this.$bus.$on('unlike:recipe', this.onMyUnLikeRecipeListeners.bind(this))
        }

        if(this.isSharedTab || this.isSavedTab){
            this.$bus.$on('recipe:create', this.onShareRecipeListeners.bind(this))
            this.$bus.$on('recipe:create:saved', this.onSaveRecipeListeners.bind(this))
        }

        this.$bus.$on('recipe:update', this.onUpdatedRecipeListeners.bind(this))
        this.$bus.$on('recipe:delete', this.onDeletedRecipeListeners.bind(this))
    },
    beforeDestroy() {
        this.$bus.$off('recipe:add:permission', this.onAddRecipePermission.bind(this))

        if(this.isLovedTab){
            this.$bus.$off('like:recipe', this.onMyLikeRecipeListeners.bind(this))
            this.$bus.$off('unlike:recipe', this.onMyUnLikeRecipeListeners.bind(this))
        }

        if(this.isSharedTab || this.isSavedTab){
            this.$bus.$off('recipe:create', this.onShareRecipeListeners.bind(this))
            this.$bus.$off('recipe:create:saved', this.onSaveRecipeListeners.bind(this))
        }

        this.$bus.$off('recipe:update', this.onUpdatedRecipeListeners.bind(this))
        this.$bus.$off('recipe:delete', this.onDeletedRecipeListeners.bind(this))
    }
}