<template>
  <b-button-group size="sm">
    <b-button :variant="variant"  :disabled="noLike" @click="onLike" :title="titleActionLike">
      <b-icon-heart-fill v-if="makeLike || noLike" :class="classesLike"/>
      <b-icon-heart v-else :class="classesLike"/>
      <span v-if="value.length>0">{{value.length}}</span>
    </b-button>
    <b-dropdown v-show="value.length > 0" :title="titleToggleListLiker" :variant="variant" @show="showListLikers=true" @hide="showListLikers=false">
      <b-dropdown-item v-for="(liker, ind) in mappedLike" :key="ind" :disabled="liker.anonymous>0">
        <avatar v-if="liker.user" v-model="liker.user.img" :size=30 :user="liker.user._id" :userID="liker.user.userID" link/>
        <span v-else-if="liker.anonymous" class="anonymous"> Anonimo <span v-if="liker.anonymous > 1">( x {{ liker.anonymous }} )</span></span>
      </b-dropdown-item>
    </b-dropdown>
  </b-button-group>
</template>

<script>

import {mapActions, mapGetters} from "vuex";
import UserMixin from '@components/mixins/user.mixin'
export default {
  name: "like",
  mixins: [UserMixin],
  props: {
    value: Array,
    noLike: Boolean,
    recipe: Object,
    comment: Object,
    variant: {
      type: String,
      default: 'primary'
    }
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
      like: 0,

      showListLikers: false
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
    },
    titleActionLike(){
      if(!this.noLike) return this.makeLike ? 'Non mi piace più' : 'Mi Piace'
    },
    titleToggleListLiker(){
      return (this.showListLikers ? 'Nascondi': 'Mostra') + ' Likers'
    },
    mappedLike(){
      return [ { anonymous: this.value.filter(l => !l.user).length }, ...this.value.filter(l => l.user) ]
    },
  },
  methods: {
    ...mapActions({
      anonymousJustLikeCommentInSession: 'likes/anonymous:is:like-comment',
      anonymousJustLikeRecipeInSession: 'likes/anonymous:is:like-recipe'
    }),

    route(liker){
      if(liker.user) return { name: 'single-user', params: { id: liker.user?._id } }
    },

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
      this.value.filter(like => like.user?._id === id).forEach(like => like.user = null)
    },
    onUpdateInfos(userInfo){
      if(userInfo){
        this.value
            .filter(like => like.user?._id === userInfo._id)
            .forEach(like => this._updateUserInformation(like.user, userInfo))
      }
    },
  },
  created() {
    this.$bus.$on('like:recipe', this.onLikeRecipeListener.bind(this))
    this.$bus.$on('unlike:recipe', this.onUnLikeRecipeListener.bind(this))
    if(this.comment) {
      this.$bus.$on('like:comment', this.onLikeCommentListener.bind(this))
      this.$bus.$on('unlike:comment', this.onUnLikeCommentListener.bind(this))
    }
    this.$bus.$on('user:update:info', this.onUpdateInfos.bind(this))
    this.$bus.$on('user:delete', this.onDeletedUserListeners.bind(this))

    this._checkLikeOrUnlike()
  },
  beforeDestroy() {
    this.$bus.$off('like:recipe', this.onLikeRecipeListener.bind(this))
    this.$bus.$off('unlike:recipe', this.onUnLikeRecipeListener.bind(this))
    if(this.comment) {
      this.$bus.$off('like:comment', this.onLikeCommentListener.bind(this))
      this.$bus.$off('unlike:comment', this.onUnLikeCommentListener.bind(this))
    }
    this.$bus.$off('user:update:info', this.onUpdateInfos.bind(this))
    this.$bus.$off('user:delete', this.onDeletedUserListeners.bind(this))
  }
}
</script>

<style scoped>
.anonymous{
  color: black;
}
</style>
