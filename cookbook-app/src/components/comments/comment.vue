<template>
  <div :id="commentId">
    <wrap-loading v-model="updatingOrDeleting.process">
      <!-- Modal for reporting-->
      <b-modal v-model="showReportComment" title="Segnala commento"  @ok="report" centered ok-only>
        <p>Vuoi segnalare il commento di <strong>{{ comment.user | name }}</strong>?</p>
      </b-modal>

      <!-- Modal for reporting-->
      <b-modal v-model="showDeleteComment" title="Cancella commento"  @ok="removeComment" centered ok-only>
        <p>Vuoi cancellare il tuo commento ?</p>
      </b-modal>

      <b-container :class="classComment">

        <b-row class="comment-user" align-v="center">
          <b-col cols="auto" class="px-0">
            <avatar :value="isThereProfileImg" :size="40" :user="comment.user && comment.user._id" class="mr-2"/>
            <router-link v-if="comment.user" :to="{name: 'single-user', params: {id: comment.user._id }}">{{ comment.user | name }}</router-link>
            <span v-else>{{ comment.user | name }}</span>
          </b-col>
        </b-row>

        <b-row class="comment-popover" cols="1">
          <b-col class="comment-content mt-1">
            <mini-text-editor v-model="changeMode" :content="comment.content" @end-edit="changeComment">
              <template #edit>Salva</template>
            </mini-text-editor>
            <b-container v-if="!changeMode" fluid class="px-0">
              <b-row v-if="isDeletedComment" class="mb-2">
                <b-col><font-awesome-icon icon="ban"/> <span>Commento cancellato.</span></b-col>
              </b-row>
              <b-row v-else-if="isReportedComment" class="mb-2" cols="1" align-v="center">
                <b-col><b-icon-exclamation-triangle-fill/> <span>Commento segnalato.</span> </b-col>
                <b-col class="text-left pl-1"><b-button variant="link" @click="showReportedComment">Visualizza comunque</b-button></b-col>
              </b-row>
              <b-row v-else>
                <b-col><span >{{ comment.content }}</span></b-col>
              </b-row>
            </b-container>
          </b-col>

          <b-col v-if="!isDeletedComment && !isReportedComment" class="comment-footer px-0">
            <b-container fluid class="my-2">
              <b-row cols="1" cols-sm="2" align-v="center">
                <b-col class="text-left pr-0">
                  <small class="timestamp">{{ comment.timestamp | dateFormat(language) }}</small>
                </b-col>
                <b-col v-if="youCanCommentOrReport" class="text-right pr-1">
                  <b-button-group class="actions" >
                    <b-button title="Mi piace" variant="link">
                      <like v-model="comment.likes" :recipe="recipe" :comment="comment" :no-like="youNotMakeLike"/>
                    </b-button>
                    <b-button title="Segnala commento" variant="link" @click="showReportComment = true" ><b-icon-flag-fill variant="danger" /></b-button>
                    <b-button title="Rispondi al commento" variant="link" :ref="editorCommentId" v-b-toggle="editorCommentId"> <b-icon-reply-fill variant="success" /></b-button>
                  </b-button-group>
                </b-col>
                <b-col  v-if="isOwnerComment" class="text-right">
                  <b-button-group >
                    <b-button variant="link" disabled>
                      <like v-model="comment.likes" :recipe="recipe" :comment="comment" :no-like="youNotMakeLike"/>
                    </b-button>
                    <b-button v-if="!changeMode" title="Modifica commento" @click="changeMode = true" variant="link">
                      <b-icon-pencil-square variant="primary"/>
                    </b-button>
                    <b-button title="Cancella commento" @click="showDeleteComment = true" variant="link"><b-icon-trash-fill variant="danger" /></b-button>
                  </b-button-group>
                </b-col>
              </b-row>
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

        <b-row cols="1" v-if="hasResponses">
          <b-col class="text-right px-0">
            <b-button class="toggle-conversation" variant="link" v-b-toggle="responsesCommentId"> {{showConversation ? 'Nascondi': 'Visualizza'}} conversazione </b-button>
          </b-col>
        </b-row>
      </b-container>
    </wrap-loading>

    <b-collapse :id="responsesCommentId" v-model="showConversation">
      <div class="responses" v-if="hasResponses">
        <comment v-for="response in comment.responses" :key="response._id"
                 :comment="response" :recipe="recipe" :language="language"
                 :path-hash-comment="pathHashComment"/>
      </div>
    </b-collapse>

  </div>
</template>
<script>

import Server from '@api/server.info'
import {mapGetters} from "vuex";

export default {
  name: "comment",
  props: {
    comment: Object,
    recipe: Object,
    language: String,

    pathHashComment: Array,
  },
  data(){
    return {
      showReportComment: false,
      showDeleteComment: false,

      showConversation: false,

      changeMode: false,

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
    dateFormat: function (text, lang){
      return dateFormat(text, lang)
    }
  },
  computed:{

    responsesCommentId(){
      return 'responses-comment-'+ this.comment._id
    },
    hasResponses(){
      return this.comment.responses && this.comment.responses.length
    },
    commentId(){
      return 'comment-'+ this.comment._id
    },
    editorCommentId(){
      return 'editor-' + this.comment._id
    },
    isThereProfileImg(){
      return this.comment.user && this.comment.user.img
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

    ...mapGetters({
      userIdentifier: 'session/userIdentifier',
      username: 'session/username',
      isAdmin: 'session/isAdmin',
      isLoggedIn: 'session/isLoggedIn'
    }),

    classComment(){
      return {
        'comment': true,
        'deleted-comment': this.isDeletedComment,
        'reported-comment': this.isReportedComment,
      }
    }

  },
  methods:{
    /* REPORT */
    showReportedComment(){
      this.comment.reported = false
      this.$emit('show-reported-comment')
      console.debug("Show Reported comment.")
    },

    report(){
      this.$store.dispatch('comments/report', {ownerID: this.recipe.owner._id, recipeID: this.recipe._id, commentID: this.comment._id})
         .then(({status, data})=> {
           this.comment.reported = true
           this.$emit('reporting', this.comment)
           if(status === 200){
             const _comment = clone(this.comment)
             this.$socket.emit('comment:report',
                 Object.assign(_comment, { recipe: {_id: this.recipe._id, name: this.recipe.name, owner: this.recipe.owner} }),
                 this.isLoggedIn ? {_id: this.userIdentifier, userID: this.username}: undefined)
           }
         })
         .catch(this.handleRequestErrors.comments.updateComment)
    },

    /*RESPONSE*/
    closeEditorResponse(){
      let editorBtn = this.$refs[ this.editorCommentId ]
      if(editorBtn) editorBtn.click()
    },
    addResponse(text){
      this.responding.process = true
      this.$store.dispatch('comments/response', { ownerID: this.recipe.owner._id, recipeID: this.recipe._id, commentID: this.comment._id, content: text })
         .then(({data}) => {
           this.comment.responses.push(data)
           console.debug('You answered.')
           this.$emit('add-response', data)
           this.showConversation = true

           const _comment = clone(this.comment)
           this.$socket.emit('comment:response', Object.assign(_comment,
               { recipe: {_id: this.recipe._id, name: this.recipe.name, owner: this.recipe.owner} }), data)
           return true
         })
         .catch(this.handleRequestErrors.comments.createCommentOrResponse)
         .then(success => this.responding = {process: false, success})
    },

    /*CHANGE CONTENT COMMENT*/
    changeComment(newContent){
      if(this.comment.content !== newContent) {
        this.updatingOrDeleting.process = true
        this.$store.dispatch('comments/update', {
          ownerID: this.recipe.owner._id,
          recipeID: this.recipe._id,
          commentID: this.comment._id,
          content: newContent
        })
        .then(({data}) => {
          console.debug('Update comment = ', data)
          this.comment.content = newContent

          this.$socket.emit('comment:update', this.comment)
          this.changeMode = false
          return true
        })
        .catch(this.handleRequestErrors.comments.updateComment)
        .then(success => this.updatingOrDeleting = {process: false, success})
      }
    },

    /* REMOVE COMMENT*/
    removeComment(){
      this.updatingOrDeleting.process = true

      this.$store.dispatch('comments/remove', {ownerID: this.recipe.owner._id, recipeID: this.recipe._id, commentID: this.comment._id } )
         .then(({data}) => {
           this.comment.content = ""
           this.$emit('remove', this.comment)
           this.$socket.emit('comment:delete', this.comment._id)
           return true
         })
         .catch(this.handleRequestErrors.comments.deleteComment)
         .then(success => this.updatingOrDeleting = {process: false, success})
    },

    /* Listeners notification */
    renderReportedComment(commentID){
      if(this.comment._id === commentID) this.comment.reported = true
    },
    renderResponseComment(notification, response){
      if(response && this.comment._id === response.comment) pushIfAbsent(this.comment.responses, response.data)
    },

    /* Listeners update */
    renderUpdateComment(_comment){
      if(_comment && _comment._id === this.comment._id) this.comment.content = _comment.content
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
    this.$bus.$on('comment:report', this.renderReportedComment.bind(this))
    this.$bus.$on('comment:response',  this.renderResponseComment.bind(this))

    this.$bus.$on('comment:update',  this.renderUpdateComment.bind(this))
    this.$bus.$on('comment:delete',  this.renderDeleteComment.bind(this))
    this.$bus.$on('comment:unreport',  this.renderUnreportedComment.bind(this))

    this.$bus.$on('user:update:info', this.onUpdateInfos.bind(this))
    this.$bus.$on('user:delete', this.onDeletedUserListeners.bind(this))

    this.showConversation = !!this.pathHashComment.find(c => c === this.comment._id)
    console.debug('comment ', this.comment._id, ' showConversation ', this.showConversation)
  },
  beforeDestroy() {
    this.$bus.$off('comment:report', this.renderReportedComment.bind(this))
    this.$bus.$off('comment:response', this.renderResponseComment.bind(this))

    this.$bus.$off('comment:update', this.renderUpdateComment.bind(this))
    this.$bus.$off('comment:delete', this.renderDeleteComment.bind(this))
    this.$bus.$off('comment:unreport', this.renderUnreportedComment.bind(this))

    this.$bus.$off('user:update:info', this.onUpdateInfos.bind(this))
    this.$bus.$off('user:delete', this.onDeletedUserListeners.bind(this))
  }
}
</script>

<style lang="scss" scoped>
.responses{
  border: 1px solid lightgrey;
  border-radius: 1.25rem;
  padding: 1%;
}

.comment{
  margin-top: 1.25rem;

  & .comment-user {
    position: relative;
    padding-left: 13px;
    & > div {
      & > a {
        color: white;
      }
    }
    &:after{
      border: 1em solid transparent;
      border-top-color: $comment-bg-color;
      content: '';
      margin-left: 5em;
      position: absolute;
      top: 44%;
      left: -63px;
      width: 0;
      height: 0;
      transform: rotate(180deg);
    }
  }

  & .comment-popover {
    border: 1px solid lightgrey;
    border-radius: 10px;
    margin-top: 7px;
    background-color: $comment-bg-color;
    color: black;

    & .footer{
      margin-top: 10px;
      border-radius: 10px;
      & .timestamp{
        float: left;
        padding-right: 10px;
      }
      & .actions {
        & button {
          padding-left: 0;
        }
      }
    }
  }

  button.toggle-conversation{
    color: white;
  }
}

.reported-comment {
  & .comment-user {
    &:after{
      border-top-color: $comment-reported-bg-color!important;

    }
  }
  & .comment-popover {
    background-color: $comment-reported-bg-color!important;
    border-color: $comment-reported-bg-color!important;
  }
}

.deleted-comment {
  & .comment-user {
    &:after{
      border-top-color: $comment-deleted-bg-color!important;
    }
  }
  & .comment-popover {
    background-color: $comment-deleted-bg-color!important;
    border-color: $comment-deleted-bg-color!important;
  }
}

</style>
