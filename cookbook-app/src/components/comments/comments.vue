<template>
  <b-card class="card-comments">
   <b-container fluid class="px-0">
     <!-- Commenting -->
     <b-row class="add-comment" v-if="couldComment">
       <b-col class="text-right pr-1">
         <b-button ref="btn-comment" variant="link" v-b-toggle="editorAddComment">Commenta</b-button>
         <b-collapse :id="editorAddComment"  class="px-2">
           <wrap-loading v-model="commenting.process">
             <mini-text-editor :reset-content="commenting.success" @end-edit="addComments" @close="closeEditorComment" >
               <template #edit>Commenta</template>
             </mini-text-editor>
           </wrap-loading>
         </b-collapse>
       </b-col>
     </b-row>

     <!-- LIST  COMMENTS -->
     <b-row v-for="comment in value" :key="comment._id" class="comment-text" align-h="center" cols="1" cols-sm="1">
       <b-col class="px-0 mb-2"> <comment :comment="comment" :recipe="recipe" :path-hash-comment="pathHashComment"/> </b-col>
     </b-row>
     <b-row v-if="value.length === 0"> <b-col> <span class="no-comments"> Nessun commento. </span> </b-col> </b-row>
   </b-container>
  </b-card>

</template>

<script>
import {mapGetters} from "vuex";

export default {
  name: "comments",
  props: {
    value:  Array,
    recipe: Object
  },
  data(){
    return {
      commenting: {
        process: false,
        success: null
      }
    }
  },
  computed:{
    editorAddComment(){
      return 'editor-comment-'+ this.recipe._id
    },

    ...mapGetters({
      isAdmin: "session/isAdmin"
    }),
    couldComment(){
      return !this.isAdmin && this.recipe.owner
    },

    pathHashComment(){
      let commentId =  this.$route.hash.split('#')[1]?.split('-')[1]
      console.debug('Go to comment: ', commentId)
      return visitUntil(this.value, commentId,  {
        flatterField: 'responses',
        finderField: '_id',
        mapperField: '_id',
        includeChild: true
      })
    },
  },

  methods: {
    closeEditorComment(){
      let editorBtn = this.$refs["btn-comment"]
      if(editorBtn) editorBtn.click()
    },

    addComments(text){
      this.commenting.process = true

      this.$store.dispatch('comments/create', {ownerID: this.recipe.owner._id, recipeID: this.recipe._id, content: text})
         .then(({data}) => {
           this.value.push(data)
           //this.$emit('input', [...this.value, ...[data]])

           this.$socket.emit('recipe:comment', {_id: this.recipe._id, name: this.recipe.name, owner: this.recipe.owner}, data)

           console.debug('You commented.')
           return true
         })
         .catch(this.$store.$api.errorsHandler.comments.createCommentOrResponse)
         .then(success => this.commenting = { process: false, success })
    },

    /* Listeners notification */
    onAddCommentListener(notification, comment){
      if(comment) pushIfAbsent(this.value, comment)
    }
  },
  created() {
    this.$bus.$on('recipe:comment', this.onAddCommentListener.bind(this))
  },
  beforeDestroy() {
    this.$bus.$off('recipe:comment', this.onAddCommentListener.bind(this))
  }
}
</script>

<style scoped lang="scss">

.card-comments{
  background-color: $component-color!important;
  border: none!important;

  & .add-comment button{
    color: white;
  }
  & .card-body{
    color: black
  }
  & .no-comments{
    color: white;
    padding-left: 10px;
  }
}

</style>
