<template>
  <div>
    <b-icon-heart-fill v-if="makeLike" @click="onLike" :class="classesLike"/>
    <b-icon-heart v-else  @click="onLike" :class="classesLike"/>
    <span v-if="value.length>0">{{value.length}}</span>
  </div>
</template>

<script>

import {mapActions, mapGetters} from "vuex";

export default {
  name: "like",
  props: {
    value: Array,
    noLike: Boolean,
    recipe: Object,
    comment: Object
  },
  watch:{
    value(val, old){
      console.debug(`Like update = ${JSON.stringify(old)} -> ${JSON.stringify(val)}`)
      this._checkLikeOrUnlike()
      console.debug(`I make like = makeLike`, this.makeLike)
    },
  },
  data(){
    return {
      makeLike: false,
      like: 0
    }
  },
  computed: {
    ...mapGetters({
      userIdentifier: 'session/userIdentifier',
    }),
    classesLike(){
      return {
        'mr-1': true,
        'icon': !this.noLike
      }
    }
  },
  mounted() {
   this._checkLikeOrUnlike()
  },
  methods: {
    ...mapActions({
      anonymousJustLikeCommentInSession: 'likes/anonymous:is:like-comment',
      anonymousJustLikeRecipeInSession: 'likes/anonymous:is:like-recipe'
    }),
    onLike(){
      if(!this.noLike){

        const commentID = this.comment ? this.comment._id: undefined

        if(this.makeLike) {
          let like = null;
          if(this.userIdentifier) like = this.value.find(l => l.user && l.user._id === this.userIdentifier);
          else like = this.value.find(l => !l.user)
          console.debug('Like to remove = ', JSON.stringify(like, null, 1))

          this.$store.dispatch('likes/remove', { ownerID: this.recipe.owner._id, recipeID: this.recipe._id, likeID: like._id, commentID })
             .then(({data})=> {
                console.debug('Unlike ', data)
                this.$emit('input', this.value.filter(l => l._id !== like._id))
                this.$emit('unlike')

                if(commentID) this.$socket.emit('unlike:comment', this.comment._id, like._id)
                else this.$socket.emit('unlike:recipe', this.recipe._id, like._id)

             })
             .catch(this.handleRequestErrors.likes.makeOrUnmakeLike)

        }
        else {
          this.$store.dispatch('likes/add', { ownerID: this.recipe.owner._id, recipeID: this.recipe._id, commentID })
             .then(({data})=> {
                  console.debug('Like ', data)

                  this.$emit('input', [...this.value, ...[data]])
                  this.$emit('like')

                  if(commentID) this.$socket.emit('like:comment', { _id: this.comment._id, user: this.comment.user, recipe: {_id: this.recipe._id, name: this.recipe.name, owner: this.recipe.owner } }, data)
                  else this.$socket.emit('like:recipe', {_id: this.recipe._id, name: this.recipe.name, owner: this.recipe.owner}, data)

             })
             .catch(this.handleRequestErrors.likes.makeOrUnmakeLike)
        }
      }
    },

    _checkLikeOrUnlike(){
      if(this.userIdentifier) {
        this.makeLike = this.value.find(l => l.user && l.user._id === this.userIdentifier) !== undefined
      } else {
        if(this.comment) this.anonymousJustLikeCommentInSession(this.comment._id).then(val => this.makeLike = val)
        else this.anonymousJustLikeRecipeInSession(this.recipe._id).then(val => this.makeLike = val)
      }
    },

    /* Listeners notification */
    onLikeRecipeListener(notification, like){
      if(!this.comment && like && notification.otherInfo.recipe._id === this.recipe._id) pushIfAbsent(this.value, like)

    },
    onLikeCommentListener(notification, like){
      if(this.comment && like && notification.otherInfo.comment._id === this.comment._id) pushIfAbsent(this.value, like)
    },
    /* Listeners update */
    onUnLikeRecipeListener(recipeID, likeID) {
      if(!this.comment && likeID && recipeID === this.recipe._id) removeIfPresent(this.value, l => l._id === likeID)
    },
    onUnLikeCommentListener(commentID, likeID) {
      if(this.comment && likeID && commentID === this.comment._id) removeIfPresent(this.value, l => l._id === likeID)
    },
    onDeletedUserListeners(id){
      this.value.filter(like => like.user && like.user._id === id).forEach(like => like.user = null)
    }
  },
  created() {
    this.$bus.$on('like:recipe', this.onLikeRecipeListener.bind(this))
    this.$bus.$on('unlike:recipe', this.onUnLikeRecipeListener.bind(this))
    if(this.comment) {
      this.$bus.$on('like:comment', this.onLikeCommentListener.bind(this))
      this.$bus.$on('unlike:comment', this.onUnLikeCommentListener.bind(this))
    }
    this.$bus.$on('user:delete', this.onDeletedUserListeners.bind(this))
  },
  beforeDestroy() {
    this.$bus.$off('like:recipe', this.onLikeRecipeListener.bind(this))
    this.$bus.$off('unlike:recipe', this.onUnLikeRecipeListener.bind(this))
    if(this.comment) {
      this.$bus.$off('like:comment', this.onLikeCommentListener.bind(this))
      this.$bus.$off('unlike:comment', this.onUnLikeCommentListener.bind(this))
    }
    this.$bus.$off('user:delete', this.onDeletedUserListeners.bind(this))
  }
}
</script>

<style scoped>

</style>
