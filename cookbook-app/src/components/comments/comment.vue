<template>
  <li :id="commentId">
    <wrap-loading v-model="updatingOrDeleting.process">
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
          <b-col class="text-center"><b-icon-exclamation-triangle-fill/> <span>Commento cancellato.</span> </b-col>
        </b-row>
        <b-row v-else-if="isReportedComment" class="reported-comment" cols="1" cols-sm="1">
          <b-col class="text-center"><b-icon-exclamation-triangle-fill/> <span>Commento segnalato.</span> </b-col>
          <b-col class="text-center"><b-button variant="link" @click="showReportedComment">Visualizza comunque</b-button></b-col>
        </b-row>
        <b-row v-else class="comment-container" cols="1">
          <b-col class="comment-header pl-0">
            <b-row>
              <b-col>
                <b-row cols="1" align-v="center" class="avatar-userID-container ml-1">
                  <b-col class="text-center avatar mt-4 px-0">
                    <avatar :value="isThereProfileImg(comment.user)" :user="comment.user && comment.user._id"/>
                  </b-col>
                  <b-col class="text-center userID px-0">
                    <router-link v-if="comment.user" :to="{name: 'single-user', params: {id: comment.user._id }}">{{ comment.user | name }}</router-link>
                    <span v-else>{{ comment.user | name }}</span>
                  </b-col>
                </b-row>
              </b-col>
              <b-col cols="3" class="text-right mt-3 mr-2">
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
                  <b-col cols="12" class="text-right mt-1">
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
                  <b-col cols="3" class="text-right"><like v-model="comment.likes" :recipe="recipe" :comment="comment" :no-like="youNotMakeLike"/> </b-col>
                </b-row>
              </b-container>
              <b-button-group class="actions">
                <b-button variant="link" @click="showReportComment = true" v-if="youCanCommentOrReport">Segnala</b-button>
                <b-button variant="link" :ref="editorCommentId" v-if="youCanCommentOrReport"  v-b-toggle="editorCommentId">Rispondi</b-button>
              </b-button-group>
            </b-container>

            <b-collapse class="col" :id="editorCommentId"  v-if="youCanCommentOrReport">
              <wrap-loading v-model="responding.process">
                <mini-text-editor :reset-content="responding.success" @end-edit="addResponse" @close="closeEditorResponse">
                  <template #edit>Rispondi</template>
                </mini-text-editor>
              </wrap-loading>
            </b-collapse>
          </b-col>
        </b-row>
      </div>
    </wrap-loading>

    <ul v-if="comment.responses && comment.responses.length">
      <comment v-for="response in comment.responses" :key="response._id"
                    :comment="response" :recipe="recipe" :language="language" />
    </ul>
  </li>
</template>
<script>
import {bus} from "@/main";
import {dateFormat, clone} from "@services/utils";

import api, {Server} from '@api'
import {mapGetters} from "vuex";
import WrapLoading from "../wrap-loading";

export default {
  name: "comment",
  components: {WrapLoading},
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
      },

      responding: {
        process: false,
        success: null
      },
      updatingOrDeleting: {
        process: false,
        success: null
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
    commentId(){
      return 'comment-'+ this.comment._id
    },
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
      return this.isAdmin || this.isOwnerComment || !this.recipe.owner
    },

    youCanCommentOrReport(){
      return !this.isAdmin && !this.isOwnerComment && this.recipe.owner
    },

    isDeletedComment(){
      return !this.comment.content || this.comment.content.length === 0
    },
    isReportedComment(){
      return this.comment.reported !== false
    },

    ...mapGetters(['accessToken', 'userIdentifier', 'username', 'isAdmin', 'isLoggedIn', 'socket'])
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
         .updateComment(this.recipe.owner._id, this.recipe._id, this.comment._id, this.accessToken, {action: 'report'})
         .then(({status, data})=> {
           this.comment.reported = true
           this.$emit('reporting', this.comment)
           if(status === 200){
             const _comment = clone(this.comment)
             this.socket.emit('comment:report',
                 Object.assign(_comment, { recipe: {_id: this.recipe._id, name: this.recipe.name, owner: this.recipe.owner} }),
                 this.isLoggedIn ? {_id: this.userIdentifier, userID: this.username}: undefined)
           }
         })
         .catch(api.recipes.HandlerErrors.comments.updateComment)
    },

    /*RESPONSE*/
    closeEditorResponse(){
      let editorBtn = this.$refs[ this.editorCommentId ]
      if(editorBtn) editorBtn.click()
    },
    addResponse(text){
      this.responding.process = true
      api.recipes
         .comments
         .createResponse(this.recipe.owner._id, this.recipe._id, this.comment._id, {content: text}, this.accessToken)
         .then(({data}) => {
           this.comment.responses.push(data)
           console.debug('You answered.')
           this.$emit('add-response', data)

           const _comment = clone(this.comment)
           this.socket.emit('comment:response', Object.assign(_comment,
               { recipe: {_id: this.recipe._id, name: this.recipe.name, owner: this.recipe.owner} }), data)
           return true
         })
         .catch(api.recipes.HandlerErrors.comments.createCommentOrResponse)
         .then(success => this.responding = {process: false, success})
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
        this.updatingOrDeleting.process = true
        api.recipes
           .comments
           .updateComment(this.recipe.owner._id,
               this.recipe._id,
               this.comment._id,
               this.accessToken,
            { data: { content: this.changeMode.content } })
           .then(({data}) => {
             console.debug('Update comment = ', data)
             this.comment.content = this.changeMode.content

             this.socket.emit('comment:update', this.comment)
             this.toggleChangeMode('')
             return true
           })
           .catch(api.recipes.HandlerErrors.comments.updateComment)
           .then(success => this.updatingOrDeleting = {process: false, success})
      }

    },

    /* REMOVE COMMENT*/
    removeComment(){
      this.updatingOrDeleting.process = true
      api.recipes
         .comments
         .deleteComment(this.recipe.owner._id, this.recipe._id, this.comment._id, this.accessToken)
         .then(({data}) => {
           this.comment.content = ""
           this.$emit('remove', this.comment)
           this.socket.emit('comment:delete', this.comment._id)
           return true
         })
         .catch(api.recipes.HandlerErrors.comments.deleteComment)
         .then(success => this.updatingOrDeleting = {process: false, success})
    },

    /* Listeners notification */
    renderReportedComment(notification){
      if(this.comment._id === notification.otherInfo.comment) this.comment.reported = true
    },
    renderResponseComment(notification, response){
      if(response && this.comment._id === response.comment) this.comment.responses.push(response.data)
    },

    /* Listeners update */
    renderUpdateComment(_comment){
      if(_comment && _comment._id === this.comment._id) this.comment = _comment
    },
    renderDeleteComment(commentID){
      if(commentID === this.comment._id) this.comment.content = ''
    },
    renderUnreportedComment(commentID){
      if(this.comment._id === commentID) this.comment.reported = false
    },

    onUpdateInfos(userInfo){

      if(this.comment.user && userInfo && this.comment.user._id === userInfo._id) {
        if(userInfo.information)
          this.comment.user.img = userInfo.information.img ? Server.images.path(userInfo.information.img) : ''

        if(userInfo.userID) this.comment.user.userID = userInfo.userID
      }
    },
    onDeletedUserListeners(id){
      if(this.comment.user && this.comment.user._id === id) this.comment.user = null
    }
  },
  created() {
    bus.$on('comment:report', this.renderReportedComment.bind(this))
    bus.$on('comment:response',  this.renderResponseComment.bind(this))

    bus.$on('comment:update',  this.renderUpdateComment.bind(this))
    bus.$on('comment:delete',  this.renderDeleteComment.bind(this))
    bus.$on('comment:unreport',  this.renderUnreportedComment.bind(this))

    bus.$on('user:update:info', this.onUpdateInfos.bind(this))
    bus.$on('user:delete', this.onDeletedUserListeners.bind(this))
  },
  beforeDestroy() {
    bus.$off('comment:report', this.renderReportedComment.bind(this))
    bus.$off('comment:response', this.renderResponseComment.bind(this))

    bus.$off('comment:update', this.renderUpdateComment.bind(this))
    bus.$off('comment:delete', this.renderDeleteComment.bind(this))
    bus.$off('comment:unreport', this.renderUnreportedComment.bind(this))

    bus.$off('user:update:info', this.onUpdateInfos.bind(this))
    bus.$off('user:delete', this.onDeletedUserListeners.bind(this))
  }
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
