<template>
  <div>
    <b-icon-heart-fill v-if="makeLike" @click="onLike" :class="classesLike"/>
    <b-icon-heart v-else  @click="onLike" :class="classesLike"/>
    <span v-if="value.length>0">{{value.length}}</span>
  </div>
</template>

<script>

import api from "@api";
import {mapGetters} from "vuex";

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
      this.makeLike = val.length > old.length
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
      accessToken: 'session/accessToken',
      userIdentifier: 'session/userIdentifier',
      isAdmin: 'session/isAdmin'
    }),
    classesLike(){
      return {
        'mr-1': true,
        'icon': !this.noLike
      }
    }
  },
  mounted() {
    this.makeLike = this.value.find(l => l.user && l.user._id === this.userIdentifier) !== undefined
  },
  methods: {
    onLike(){
      if(!this.noLike){

        const commentID = this.comment ? this.comment._id: undefined

        if(this.makeLike) {
          let like = null;
          if(this.userIdentifier) like = this.value.find(l => l.user && l.user._id === this.userIdentifier);
          else like = this.value.find(l => !l.user)
          console.debug('Like to remove = ', JSON.stringify(like, null, 1))
          api.recipes
             .likes
             .unLike(this.recipe.owner._id, this.recipe._id, like._id , this.accessToken, commentID)
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
          api.recipes
             .likes
             .like(this.recipe.owner._id, this.recipe._id, this.accessToken, commentID)
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

    /* Listeners notification */
    onLikeRecipeListener(notification, like){
      if(like && notification.otherInfo.recipe === this.recipe._id) this.value.push(like)
    },
    onLikeCommentListener(notification, like){
      if(like && this.comment && notification.otherInfo.comment === this.comment._id) this.value.push(like)
    },
    /* Listeners update */
    onUnLikeRecipeListener(recipeID, likeID) {
      if(likeID && recipeID === this.recipe._id) {
        let index = this.value.findIndex(l => l._id === likeID)
        if(index !== -1) this.value.splice(index, 1)
      }
    },
    onUnLikeCommentListener(commentID, likeID) {
      if(this.comment && likeID && commentID === this.comment._id) {
        let index = this.value.findIndex(l => l._id === likeID)
        if(index !== -1) this.value.splice(index, 1)
      }
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