<template>
  <div>
    <!-- Modal for reporting-->
    <b-modal v-model="reportComment.show" title="Segnala commento"  @ok="report" centered ok-only>
      <p>Vuoi segnalare il commento di <strong>{{ userToReportedComment | name }}</strong>?</p>
    </b-modal>

    <b-row v-if="isReportedComment" class="reported-comment" cols="1" cols-sm="1">
      <b-col align="center"><b-icon-exclamation-triangle-fill/> <span>Commento segnalato.</span> </b-col>
      <b-col align="center"><b-button variant="link" @click="showReportedComment">Visualizza comunque</b-button></b-col>
    </b-row>
    <b-row v-else class="comment" cols="1" cols-sm="1">
      <b-row class="comment-user">
        <div>
          <b-img v-if="isThereProfileImg(userComment)" fluid id="img-user" width="100" height="100" rounded="circle" :src="userComment.img" @error="imgNotFound" alt="immagine profilo"></b-img>
          <b-img v-else fluid id="img-user" width="100" height="100" :src="defaultImageProfile"></b-img>
          <router-link v-if="userComment" :to="{name: 'single-user', params: {id: userComment._id }}">{{ userComment | name }}</router-link>
          <span v-else>{{ userComment | name }}</span>
        </div>
      </b-row>
      <b-row class="comment-popover">

        {{ contentComment }}
        <b-container fluid class="footer d-flex justify-content-between mt-2">
          <b-container fluid class="px-0 py-3">
            <span class="timestamp">{{ timeStampComment, language | dateFormat }}</span>
            <like v-model="likesComment" @like="like" @unlike="unlike"/>
<!--        TODO: convert or chnage like to Number -> Array -->
          </b-container>
          <b-button-group class="actions">
            <b-button variant="link" @click="openModalReporting">Segnala</b-button>
            <b-button variant="link" :ref="editorCommentId"  v-if="isAvailableResponse"  v-b-toggle="editorCommentId">Rispondi</b-button>
          </b-button-group>
        </b-container>
        <b-collapse class="col" :id="editorCommentId" v-if="isAvailableResponse" >
          <mini-text-editor @end-edit="addResponse" @close="closeEditorResponse">
            <template #edit>Rispondi</template>
          </mini-text-editor>
        </b-collapse>
      </b-row>
    </b-row>
  </div>
</template>
<script>
import {Session} from "@services/session";
import {dateFormat} from "@services/utils";

export default {
  name: "comment",
  props: {
    index: Number,
    comment: Object,
    isOwner: Boolean,
    response: {
      type: Boolean,
      default: false
    },
    language: String
  },
  data(){
    return {
      defaultImageProfile: require('@assets/icons/person-circle.svg'),
      reportComment: {
        show: false,
        isResponse: false,
        comment: ''
      },
      responseComment: null
    }
  },
  filters: {
    name(user){
      return user ? user.userID : "Anonimo"
    },
    dateFormat: dateFormat
  },
  computed:{
    userComment(){
      return this.response ? this.comment.response.owner_recipe : this.comment.user
    },
    contentComment(){
      return this.response ? this.comment.response.content : this.comment.content
    },
    timeStampComment(){
      return this.response ? this.comment.response.timestamp : this.comment.timestamp
    },
    likesComment: {
      get(){
        return this.response ? this.comment.response.likes : this.comment.likes
      },
      set(like){
        if(this.response) this.comment.response.likes = like
        else this.comment.likes = like
      }
    },

    userToReportedComment(){
      return this.reportComment.isResponse!== false ? this.reportComment.isResponse.user : this.reportComment.comment.user
    },
    isAvailableResponse(){
      return this.isOwner && !this.response && !this.responseComment
    },
    editorCommentId(){
      return 'editor-' + this.index + '-' + this.comment.number + (this.response ? '-response' : '')
    },

    isReportedComment(){
      if(this.response) return this.comment.response && this.comment.response.reported !== false
      return this.comment.reported !== false
    },
  },
  methods:{
    isThereProfileImg(user){
      return user && user.img
    },

    imgNotFound(e){
      console.error('image profile not found...')
      e.target.src = this.defaultImageProfile
    },
    /*LIKE/UNLIKE COMMENT */
    like(){
      if(this.response) console.debug("Like comment response."); else console.debug("Like comment.")

      this.$emit('like', {comment: this.comment, isResponse: this.response})
    },
    unlike(){
      if(this.response)  console.debug("UNLike comment response.");else console.debug("UNLike comment.")

      this.$emit('unlike', {comment: this.comment, isResponse: this.response})
    },

    /* REPORT */
    showReportedComment(){
      if(this.response) this.comment.response.reported = false
      else this.comment.reported = false
      this.$emit('show-reported-comment')
      console.debug("Show Reported comment.")
    },
    openModalReporting(){
      this.reportComment = {
        show: true,
        isResponse: this.response ? { user:   this.comment.response.owner_recipe }: false,
        comment: this.comment
      }
    },
    report(){
      let comment = this.reportComment.comment;
      let isResponse =  this.reportComment.isResponse
      console.debug("Reporting comment.")
      this.$emit('reporting', {comment: comment, isResponse: isResponse})
    },

    /*RESPONSE*/
    closeEditorResponse(){
      let editorBtn = this.$refs[ this.editorCommentId ]
      if(editorBtn) editorBtn.click()
    },
    addResponse(text){
      console.debug('You answered.')
      let infoUser =  Session.userInfo()
      this.responseComment = {
        content :  text,
        timestamp: Date.now(),
        owner_recipe: {_id: infoUser._id, userID: infoUser.userID },
        likes: 0,
        reported: false
      }
      this.comment.response = this.responseComment
      this.$emit('add-response', this.responseComment)
    },
  },

  mounted() {
    if(!this.response) this.responseComment = this.comment.response
  }
}
</script>

<style lang="scss" scoped>
.reported-comment{
    padding: 10px 0;
    border-radius: 10px;
    background-color: $comment-bg-color;
    margin: 10px -1%;
    color: black;
}
.comment{
  margin: 10px;
  & .comment-user {
    position: relative;

    & > div {
      display: grid;
      margin-left: 40px;
      text-align: center;
      & > a {
        color: white;
      }
    }
    &:after{
      border: 1em solid transparent;
      border-top-color: white;
      content: '';
      margin-left: 5em;
      position: absolute;
      top: 87%;
      left: -8px;
      width: 0;
      height: 0;
      transform: rotate(180deg);
    }
  }

  & .comment-popover{
    border: 1px solid lightgrey;
    border-radius: 10px;
    padding: 10px;
    margin-top: 15px;
    background-color: white;
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
}

</style>
