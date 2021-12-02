<template>
  <div>
    <b-icon-heart-fill v-if="makeLike" @click="onLike" :class="classesLike"/>
    <b-icon-heart v-else  @click="onLike" :class="classesLike"/>
    <span v-if="value.length>0">{{value.length}}</span>
  </div>
</template>

<script>

import {Session} from "@services/session";
import api from "@api";

export default {
  name: "like",
  props: {
    value: Array,
    noLike: Boolean,
    recipe: Object,
    commentID: String
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
    classesLike(){
      return {
        'mr-1': true,
        'icon': !this.noLike
      }
    }
  },
  mounted() {
    let userInfo = Session.userInfo()
    if(userInfo) this.makeLike = this.value.find(l => l.user && l.user._id === userInfo._id) !== undefined
  },
  methods: {
    onLike(){
      if(!this.noLike){
        if(this.makeLike) {
          let userInfo = Session.userInfo()
          //let like = null; if(userInfo) like = this.value.find(l => l.user && l.user._id === userInfo._id); else like = this.value.find(l => !l.user)
          let like = this.value.find(l => (userInfo && l.user && l.user._id === userInfo._id) || (!userInfo && !l.user))
          console.debug('Like to remove = ', JSON.stringify(like, null, 1))
          api.recipes
             .likes
             .unLike(this.recipe.ownerID, this.recipe.id, like._id , Session.accessToken(), this.commentID)
             .then(({data})=> {
                console.debug('Unlike ', data)
                this.$emit('input', this.value.filter(l => l._id !== like._id))
                this.$emit('unlike')
             })
              //TODO: HANDLER ERROR UN-LIKE
             .catch(err => console.error(err) )

        }
        else {
          api.recipes
             .likes
             .like(this.recipe.ownerID, this.recipe.id, Session.accessToken(), this.commentID)
             .then(({data})=> {
                  console.debug('Like ', data)

                  this.$emit('input', [...this.value, ...[data]])
                  this.$emit('like')
             })
              //TODO: HANDLER ERROR LIKE
             .catch(err => console.error(err) )
        }
      }
    }
  }
}
</script>

<style scoped>

</style>