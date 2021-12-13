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
    ...mapGetters(['accessToken', 'userIdentifier', 'isAdmin']),
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
        if(this.makeLike) {
          let like = null;
          if(this.userIdentifier) like = this.value.find(l => l.user && l.user._id === this.userIdentifier);
          else like = this.value.find(l => !l.user)
          console.debug('Like to remove = ', JSON.stringify(like, null, 1))
          api.recipes
             .likes
             .unLike(this.recipe.ownerID, this.recipe.id, like._id , this.accessToken, this.commentID)
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
             .like(this.recipe.ownerID, this.recipe.id, this.accessToken, this.commentID)
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