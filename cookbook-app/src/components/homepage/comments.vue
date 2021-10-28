<template>
  <b-card class="card-comments">

    <!-- Commenting -->
    <div class="add-comment" v-if="!isOwner">
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
    <b-row v-for="(comment, ind) in value" :key="comment._id" class="comment-text" align-h="center" cols="1" cols-sm="1">
      <b-col>
        <comment :comment="comment"
                 :isOwner="isOwner"
                 :index="ind"
                 :language="language"
                 @like="like"
                 @unlike="unlike"
                 @add-response="addResponse(ind, $event)"
                 @reporting="report"/>
      </b-col>
      <!-- response of the comment -->
      <b-col v-if="comment.response" class="comment-text-response" cols="9" sm="10">
        <comment :comment="comment"
                 :isOwner="isOwner"
                 :index="ind"
                 :language="language"
                 response
                 @like="like"
                 @unlike="unlike"
                 @reporting="report"/>
      </b-col>
    </b-row>
  </b-card>

</template>

<script>
import {Session} from "@services/session";
export default {
  name: "comments",
  props: {
    value:  Array,
    recipeId: String,
    isOwner: Boolean,
    language: {
      type: String,
      default: 'it'
    },
  },

  data: function (){
    return {
      reportComment: {
        show: false,
        isResponse: false,
        comment: ''
      }
    }
  },

  computed:{
    editorAddComment(){
      return 'editor-comment-'+this.recipeId
    },
  },
  methods: {
    /* LIKE COMMENT */
    like({comment, isResponse}){
      //TODO: REQUEST ADD LIKE FROM COMMENT/RESPOSNE
      if(isResponse)  console.log("Like comment response.")
      else console.log("Like comment.")
    },
    /* UNLIKE COMMENT */
    unlike({comment, isResponse}){
      //TODO: REQUEST REMOVE LIKE FROM COMMENT/RESPOSNE
      if(isResponse)  console.log("UNLike comment response.")
      else console.log("UNLike comment.")
    },

    /* COMMENT */
    closeEditorComment(){
      let editorBtn = this.$refs["btn-comment"]
      if(editorBtn) editorBtn.click()
    },
    addComments(text){
      //TODO: REQUEST ADD COMMENT
      let userInfo = Session.userInfo()
      let comment = {
        user: userInfo ? {_id: userInfo._id, userID: userInfo.userID} : undefined,
        content: text,
        timestamp: Date.now(),
        likes: 0,
        reported: false
      }
      this.value.unshift(comment)
      console.log('You commented.')
    },

    /*REPORTING*/
    report({comment, isResponse}){
      //TODO: REQUEST REPORT COMMENT/RESPONSE
      let userInfo = Session.userInfo()
      let report = {
        who: userInfo ? {_id: userInfo._id, userID: userInfo.userID} : 'anonymous',
        timestamp: Date.now()
      }
      if(isResponse) comment.response.reported = report
      else comment.reported = report
      console.log("Reporting comment.")
    },

    /*RESPONSE*/
    addResponse(index, response){
      //TODO: REQUEST ADD RESPONSE OF COMMENT
      this.value.splice(index, 1, Object.assign(this.value[index], { response: response }))
      console.log('You answered.')
    },
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
}

</style>