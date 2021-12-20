<template>
  <li>
    <div>
      <!-- Modal for reporting-->
      <b-modal v-model="showReportComment" title="Segnala commento"  @ok="report" centered ok-only>
        <p>Vuoi segnalare il commento di <strong>{{ comment.user | name }}</strong>?</p>
      </b-modal>

      <!-- Modal for reporting-->
      <b-modal v-model="showDeleteComment" title="Cancella commento"  @ok="removeComment" centered ok-only>
        <p>Vuoi cancellare il tuo commento ?</p>
      </b-modal>

      <b-row v-if="isDeletedComment" class="deleted-comment">
        <b-col align="center"><b-icon-exclamation-triangle-fill/> <span>Commento cancellato.</span> </b-col>
      </b-row>
      <b-row v-else-if="isReportedComment" class="reported-comment" cols="1" cols-sm="1">
        <b-col align="center"><b-icon-exclamation-triangle-fill/> <span>Commento segnalato.</span> </b-col>
        <b-col align="center"><b-button variant="link" @click="showReportedComment">Visualizza comunque</b-button></b-col>
      </b-row>
      <b-row v-else class="comment-container" cols="1">
        <b-col class="comment-header pl-0">
          <b-row>
            <b-col>
              <b-row cols="1" align-v="center" class="avatar-userID-container ml-1">
                <b-col align="center" class="avatar mt-4 px-0">
                  <avatar :value="isThereProfileImg(comment.user)" :user="comment.user._id"/>
                </b-col>
                <b-col align="center" class="userID px-0">
                  <router-link v-if="comment.user" :to="{name: 'single-user', params: {id: comment.user._id }}">{{ comment.user | name }}</router-link>
                  <span v-else>{{ comment.user | name }}</span>
                </b-col>
              </b-row>
             </b-col>
            <b-col cols="3" align="end" class="mt-3 mr-2">
              <div class="right">
                <b-button-group>
                  <b-button :id="changeCommentId" v-if="isOwnerComment" @click="toggleChangeMode(comment.content)" variant="primary">
                    <b-icon-x-square-fill v-if="changeMode.show"/>
                    <b-icon-pencil-square v-else/>
                  </b-button>
                  <b-tooltip :target="changeCommentId">Modifica commento</b-tooltip>
                  <b-button :id="deleteCommentId" v-if="isOwnerComment" @click="showDeleteComment = true" variant="danger"><b-icon-trash-fill /></b-button>
                  <b-tooltip :target="deleteCommentId">Cancella commento</b-tooltip>
                </b-button-group>
              </div>
            </b-col>
          </b-row>
        </b-col>
        <b-col class="comment-content">
          <div v-if="changeMode.show">
            <b-form>
              <b-form-row cols="1">
                <b-col cols="12">
                  <b-form-group :label-for="changeFormCommentId">
                    <b-form-textarea :id="changeFormCommentId" v-model="changeMode.content" rows="5" />
                  </b-form-group>
                </b-col>
                <b-col cols="12" align="end" class="mt-1">
                  <b-button-group v-if="changeMode.content.length">
                    <b-button variant="primary" @click="changeComment">Salva</b-button>
                  </b-button-group>
                </b-col>
              </b-form-row>
            </b-form>
          </div>
          <span v-else>{{ comment.content }}</span>

        </b-col>
        <b-col class="comment-footer">
          <b-container fluid class="footer d-flex justify-content-between mt-2">
            <b-container fluid class="px-0 py-3">
              <b-row cols="2" align-h="between">
                <b-col cols="8"><span class="timestamp">{{ comment.timestamp, language | dateFormat }}</span> </b-col>
                <b-col cols="3" align="end"><like v-model="comment.likes" :recipe="recipe" :commentID="comment._id" :no-like="youNotMakeLike"/> </b-col>
              </b-row>
            </b-container>
            <b-button-group class="actions">
              <b-button variant="link" @click="showReportComment = true" v-if="youCanCommentOrReport">Segnala</b-button>
              <b-button variant="link" :ref="editorCommentId" v-if="youCanCommentOrReport"  v-b-toggle="editorCommentId">Rispondi</b-button>
            </b-button-group>
          </b-container>

          <b-collapse class="col" :id="editorCommentId"  v-if="youCanCommentOrReport">
            <mini-text-editor @end-edit="addResponse" @close="closeEditorResponse">
              <template #edit>Rispondi</template>
            </mini-text-editor>
          </b-collapse>
        </b-col>
      </b-row>
    </div>

    <ul v-if="comment.responses && comment.responses.length">
      <comment v-for="response in comment.responses" :key="response._id"
                    :comment="response" :recipe="recipe" :language="language" />
    </ul>
  </li>
</template>
<script>
import {dateFormat} from "@services/utils";

import api from '@api'
import {mapGetters} from "vuex";

export default {
  name: "comment",
  props: {
    comment: Object,
    recipe: Object,
    language: String
  },
  data(){
    return {
      showReportComment: false,
      showDeleteComment: false,

      changeMode: {
        show: false,
        content: ''
      }
    }
  },
  filters: {
    name(user){
      return user ? user.userID : "Anonimo"
    },
    dateFormat: dateFormat
  },
  computed:{
    editorCommentId(){
      return 'editor-' + this.comment._id
    },
    changeCommentId(){
      return 'change-' + this.comment._id
    },
    changeFormCommentId(){
      return 'change-content-input-' + this.comment._id
    },
    deleteCommentId(){
      return 'delete-' + this.comment._id
    },

    isOwnerComment: function (){
      return this.comment.user && this.comment.user._id === this.userIdentifier
    },

    youNotMakeLike(){
      return this.isAdmin || this.isOwnerComment
    },

    youCanCommentOrReport(){
      return !this.isAdmin && !this.isOwnerComment
    },

    isDeletedComment(){
      return !this.comment.content || this.comment.content.length === 0
    },
    isReportedComment(){
      return this.comment.reported !== false
    },

    ...mapGetters(['accessToken', 'userIdentifier', 'isAdmin'])
  },
  methods:{
    isThereProfileImg(user){
      return user && user.img
    },

    /* REPORT */
    showReportedComment(){
      this.comment.reported = false
      this.$emit('show-reported-comment')
      console.debug("Show Reported comment.")
    },

    report(){
      api.recipes
         .comments
         .updateComment(this.recipe.ownerID, this.recipe.id, this.comment._id, this.accessToken, {action: 'report'})
         .then(({data})=> {
           this.comment.reported = true
           this.$emit('reporting', this.comment)
         })
          //TODO: HANDLER ERROR REPORT COMMENT
         .catch(err => {
           console.error(err)
           if(err.response && err.response.status === 409) {
             this.comment.reported = true
             this.$emit('reporting', this.comment)
           }
         })
    },

    /*RESPONSE*/
    closeEditorResponse(){
      let editorBtn = this.$refs[ this.editorCommentId ]
      if(editorBtn) editorBtn.click()
    },
    addResponse(text){
      api.recipes
         .comments
         .createResponse(this.recipe.ownerID, this.recipe.id, this.comment._id, {content: text}, this.accessToken)
         .then(({data}) => {
           this.comment.responses.push(data)
           console.debug('You answered.')
           this.$emit('add-response', data)
         })
          //TODO: HANDLER ERROR ADD RESPONSE TO COMMENT
         .catch(err => console.error(err))
    },

    /*CHANGE CONTENT COMMENT*/
    toggleChangeMode(content){
      this.changeMode = {
        show: !this.changeMode.show,
        content: content
      }
    },
    changeComment(e){
      e.preventDefault()

      if(this.comment.content !== this.changeMode.content) {
        api.recipes
           .comments
           .updateComment(this.recipe.ownerID,
               this.recipe.id,
               this.comment._id,
               this.accessToken,
            { data: { content: this.changeMode.content } })
           .then(({data}) => {
             console.debug('Update comment = ', data)
             this.comment.content = this.changeMode.content

             this.toggleChangeMode('')
           })
            //TODO: HANDLER ERROR CHANGE CONTENT OF COMMENT
           .catch(err => console.error(err))
      }

    },

    /* REMOVE COMMENT*/
    removeComment(){
      api.recipes
         .comments
         .deleteComment(this.recipe.ownerID, this.recipe.id, this.comment._id, this.accessToken)
         .then(({data}) => {
           this.comment.content = ""
           this.$emit('remove', this.comment)
         })
          //TODO: HANDLER ERROR REMOVE COMMENT
         .catch(err => console.error(err))
    }
  },
}
</script>

<style lang="scss" scoped>
li {
  list-style-type: none;
}

.reported-comment{
    padding: 10px 0;
    border-radius: 10px;
    background-color: $comment-bg-color;
    margin: 10px -1%;
    color: black;
}
.deleted-comment{
  padding: 10px 0;
  border-radius: 10px;
  background-color: $comment-bg-color;
  margin: 5% 1% 5% -1%;
  color: black;
}


.comment-container{
  background-color: white;
  border-radius: 10px;
  margin: 2% 0;

  & .comment-header {
    position: relative;

     & .avatar-userID-container {
      width: fit-content;
    }

  }

  & .comment-content {
    margin-top: 10px;
  }
}

</style>
