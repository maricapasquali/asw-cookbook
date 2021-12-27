<template>
  <b-card class="card-comments">

    <!-- Commenting -->
    <div class="add-comment" v-if="!isAdmin">
      <b-row>
        <b-col>
          <div class="d-flex justify-content-end">
            <b-button ref="btn-comment" variant="link" v-b-toggle="editorAddComment">Commenta</b-button>
          </div>
          <b-collapse :id="editorAddComment">
            <mini-text-editor @end-edit="addComments"  @close="closeEditorComment">
              <template #edit>Commenta</template>
            </mini-text-editor>
          </b-collapse>
        </b-col>
      </b-row>
    </div>

    <!-- LIST  COMMENTS -->
    <b-row v-for="comment in value" :key="comment._id" class="comment-text" align-h="center" cols="1" cols-sm="1">
      <b-col> <comment :comment="comment" :recipe="recipe" :language="language" /> </b-col>
    </b-row>
    <b-row v-if="value.length === 0"> <span class="no-comments"> Nessun commento. </span> </b-row>
  </b-card>

</template>

<script>
import {bus} from "@/main";
import api from '@api'
import {mapGetters} from "vuex";

export default {
  name: "comments",
  props: {
    value:  Array,
    recipe: Object,
    language: {
      type: String,
      default: 'it'
    },
  },

  computed:{
    editorAddComment(){
      return 'editor-comment-'+ this.recipe.id
    },

    ...mapGetters(['accessToken', 'isAdmin', 'socket'])
  },

  methods: {
    closeEditorComment(){
      let editorBtn = this.$refs["btn-comment"]
      if(editorBtn) editorBtn.click()
    },

    addComments(text){
      api.recipes
         .comments
         .createComment(this.recipe.owner._id, this.recipe._id, {content: text}, this.accessToken)
         .then(({data})=> {
           this.value.push(data)
           //this.$emit('input', [...this.value, ...[data]])

           this.socket.emit('recipe:comment', {_id: this.recipe._id, name: this.recipe.name, owner: this.recipe.owner}, data)

           console.log('You commented.')
         })
          //TODO: HANDLER ERROR ADD COMMENT TO RECIPE
         .catch(err => console.error(err))
    },

    /* Listeners notification */
    onAddCommentListener(notification, comment){
      if(comment) this.value.push(comment)
    }
  },
  created() {
    bus.$on('recipe:comment', this.onAddCommentListener.bind(this))
  },
  beforeDestroy() {
    bus.$off('recipe:comment', this.onAddCommentListener.bind(this))
  }
}
</script>

<style scoped lang="scss">

.card-comments{
  background-color: $component-color;
  border: none;

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