<template>
  <b-container fluid>
    <b-row cols="1">
      <b-col class="my-4"> <strong>Commenti segnalati</strong> </b-col>
      <b-col>
        <span v-if="!docsReported.length"> Nessun commento segnalato.</span>
        <b-row v-else cols="1" cols-sm="1" cols-md="2" cols-lg="3" cols-xl="4">
          <b-col v-for="(doc, index) in docsReported" :key="doc._id" class="mb-2" :id="reportId(doc._id)">
            <b-card>
                <div>
                  <span> Utenti segnalanti: </span>
                  <ul>
                    <li v-for="report in doc.reported"  :key="report._id">
                      <span> {{ report.user | name }} </span>
                      <span> ({{ report.timestamp | dateFormat }}) </span>
                    </li>
                  </ul>
                </div>
                <div>
                  <div>
                    <span> Utente segnalanto: </span>
                    <strong> {{ doc.user | name}} </strong>
                  </div>
                  <div>
                    <b-button v-b-toggle="doc._id" variant="link" class="pl-0 mb-3"> <strong> Commento </strong> </b-button>
                    <b-collapse :id="doc._id"> <p> {{doc.content}}  </p> </b-collapse>
                  </div>
                </div>
                <div class="d-flex justify-content-between">
                  <b-button :id="cancelCommentId(index)" variant="secondary" @click="unreported(index)"> <font-awesome-icon icon="undo" /></b-button>
                  <b-tooltip :target="cancelCommentId(index)">Annulla segnalazione</b-tooltip>
                  <b-button :id="deleteCommentId(index)" variant="danger" @click="deleteComment(index)"><b-icon-trash-fill /></b-button>
                  <b-tooltip :target="deleteCommentId(index)">Cancella</b-tooltip>
                </div>
            </b-card>
          </b-col>
        </b-row>
      </b-col>
    </b-row>
    <b-row cols="1">
      <b-col class="my-4"><strong>Commenti cancellati</strong> </b-col>
      <b-col>
        <span v-if="!docsDeleted.length"> Nessun commento cancellato.</span>
        <b-row v-else cols="1" cols-sm="1" cols-md="2" cols-lg="3" cols-xl="4">
          <b-col v-for="doc in docsDeleted"  :key="doc._id"  class="mb-2">
            <b-card>
              <div> Utenti segnalanti:
                <ul>
                  <li v-for="report in doc.reported"  :key="report._id" >
                    <span> {{ report.user | name }} </span>
                    <span> ({{ report.timestamp | dateFormat }}) </span>
                  </li>
                </ul>
              </div>
              <p> Utente segnalanto: <strong>{{doc.user | name}}</strong></p>
            </b-card>
          </b-col>
        </b-row>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import {bus} from '@/main'
import api from '@api'
import {scrollToRouterHash} from "@router";
import {dateFormat} from "@services/utils";
import {mapGetters} from "vuex";

export default {
  name: "reports-section",
  data(){
    return {
      docsReported: [],
      docsDeleted: []
    }
  },
  filters: {
    name(user){
      return user && user.userID ? user.userID : 'Anonimo'
    },
    dateFormat: dateFormat
  },
  computed:{
    ...mapGetters(['accessToken', 'socket'])
  },
  methods: {
    scrollToRouterHash,

    reportId(id){
      return 'reported-comment-' +id
    },
    deleteCommentId(index){
      return 'delete-comment-'+index
    },
    cancelCommentId(index){
      return 'cancel-comment-'+index
    },

    getReports: function (){
      api.recipes
         .comments
         .getReportedComment(this.accessToken)
         .then(({data}) => {
           console.log(data)
           this.docsReported = []
           this.docsDeleted = []
           data.forEach(comment => {
             if(comment.content) this.docsReported.push(comment)
             else this.docsDeleted.push(comment)
           })
         })
          //TODO: HANDLER ERROR GET REPORTED COMMENTS WITH admin
         .catch(err => console.error(err))
    },

    deleteComment(index){
      let comment = this.docsReported[index]
      let recipe = comment.recipe
      api.recipes
         .comments
         .deleteComment(recipe.owner._id, recipe._id, comment._id, this.accessToken)
         .then(({data}) =>{
            console.log(data)
            this.docsDeleted.push(this.docsReported[index])
            this.docsReported.splice(index, 1)

            this.socket.emit('comment:delete', comment._id)
            if(comment.user) this.socket.emit('user:strike', comment.user._id)
         })
         //TODO: HANDLER ERROR DELETE COMMENT WITH admin
         .catch(err => console.error(err))
    },
    unreported(index){
      let comment = this.docsReported[index]
      let recipe = comment.recipe
      api.recipes
         .comments
         .updateComment(recipe.owner._id, recipe._id, comment._id, this.accessToken, {action: 'un-report'})
         .then(({data}) =>{
           console.log(data)
           this.docsReported.splice(index, 1)

           this.socket.emit('comment:unreport', comment._id)
         })
          //TODO: HANDLER ERROR UNREPORTED COMMENT WITH admin
         .catch(err => console.error(err))
    },

    /*Listeners update*/
    renderDeleteComment(commentID){
      const index = this.docsReported.findIndex(rC => rC._id === commentID)
      if(index !== -1){
        this.docsDeleted.push(this.docsReported[index])
        this.docsReported.splice(index, 1)
      }
    },
    renderUnreportedComment(commentID){
      const index = this.docsReported.findIndex(rC => rC._id === commentID)
      if(index !== -1) this.docsReported.splice(index, 1)
    },

    _onUpdate(array, userInfo){
      for (const [index, comment] of array.entries()){
        if(comment.user && comment.user._id === userInfo._id && comment.user.userID !== userInfo.userID) {
          if(userInfo.userID) comment.user.userID = userInfo.userID
          array.splice(index, 1, comment)
        }
        if(comment.reported) this._onUpdate(comment.reported, userInfo)
      }
    },
    onUpdateInfos(userInfo) {
      if(userInfo && userInfo.userID){
        this._onUpdate(this.docsReported, userInfo)
        this._onUpdate(this.docsDeleted, userInfo)
      }
    },
    _onDelete(array, id){
      for (const comment of array){
        if(comment.user && comment.user._id === id) comment.user = null
        if(comment.reported) this._onDelete(comment.reported, id)
      }
    },
    onDeletedUserListeners(id){
      this._onDelete(this.docsReported, id)
      this._onDelete(this.docsDeleted, id)
    }
  },
  created() {
    bus.$on('comment:report', this.getReports.bind(this) )

    bus.$on('comment:delete',  this.renderDeleteComment.bind(this))
    bus.$on('comment:unreport',  this.renderUnreportedComment.bind(this))

    bus.$on('user:update:info', this.onUpdateInfos.bind(this))
    bus.$on('user:delete', this.onDeletedUserListeners.bind(this))
  },
  mounted() {
    this.getReports()
  },
  updated() {
    this.scrollToRouterHash()
  },
  beforeDestroy() {
    bus.$off('comment:report', this.getReports.bind(this) )

    bus.$off('comment:delete',  this.renderDeleteComment.bind(this))
    bus.$off('comment:unreport',  this.renderUnreportedComment.bind(this))

    bus.$off('user:update:info', this.onUpdateInfos.bind(this))
    bus.$off('user:delete', this.onDeletedUserListeners.bind(this))
  }
}
</script>

<style scoped>

</style>