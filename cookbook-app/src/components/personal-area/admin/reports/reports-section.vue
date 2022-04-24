<template>
  <b-container fluid>
    <b-row cols="1">
      <b-col class="my-4"> <strong>Commenti segnalati</strong> </b-col>
      <b-col :class="classCols">
        <b-spinner v-if="processing" variant="primary"></b-spinner>
        <div v-else>
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
                  <b-button title="Annulla segnalazione" variant="secondary" @click="unreported(index)"> <font-awesome-icon icon="undo" /></b-button>
                  <b-button title="Cancella" variant="danger" @click="deleteComment(index)"><b-icon-trash-fill /></b-button>
                </div>
              </b-card>
            </b-col>
          </b-row>
        </div>
      </b-col>
    </b-row>
    <b-row cols="1" class="my-2 pb-3">
      <b-col class="my-4"><strong>Commenti cancellati</strong> </b-col>
      <b-col :class="classCols">
        <b-spinner  v-if="processing" variant="primary"></b-spinner>
        <div v-else>
          <span v-if="!docsDeleted.length" class="my-4"> Nessun commento cancellato.</span>
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
        </div>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import {PendingRequestMixin} from "@mixins"
export default {
  name: "reports-section",
  mixins: [PendingRequestMixin],
  data(){
    return {
      processing: false,
      docsReported: [],
      docsDeleted: []
    }
  },
  filters: {
    name(user){
      return user && user.userID ? user.userID : 'Anonimo'
    },
    dateFormat: function (text){
      return dateFormat(text)
    }
  },
  computed:{
    classCols(){
      return {
        'text-center' : this.processing
      }
    }
  },
  methods: {
    reportId(id){
      return 'reported-comment-' +id
    },

    getReports: function (){
      let _id = 'reported-comments'
      let options = this.makeRequestOptions(_id)
      this.processing = true
      this.$store.dispatch('comments/reported', {options})
         .then(({data}) => {
           console.debug(data)
           this.docsReported = []
           this.docsDeleted = []
           data.forEach(comment => {
             if(comment.content) this.docsReported.push(comment)
             else this.docsDeleted.push(comment)
           })
         })
         .catch(this.$store.$api.errorsHandler.comments.getReportedComment)
         .finally(() => {
            this.processing = false
            this.pendingRequests.remove(_id)
         })
    },

    deleteComment(index){
      let comment = this.docsReported[index]
      let recipe = comment.recipe
      this.$store.dispatch('comments/remove', {ownerID: recipe.owner._id, recipeID: recipe._id, commentID: comment._id})
         .then(({data}) =>{
            console.debug(data)
            this.docsDeleted.push(this.docsReported[index])
            this.docsReported.splice(index, 1)

            this.$socket.emit('comment:delete', comment._id)
            if(comment.user) this.$socket.emit('user:strike', comment.user._id)
         })
         .catch(this.$store.$api.errorsHandler.comments.deleteComment)
    },
    unreported(index){
      let comment = this.docsReported[index]
      let recipe = comment.recipe
      this.$store.dispatch('comments/un-report', {ownerID: recipe.owner._id, recipeID: recipe._id, commentID: comment._id})
         .then(({data}) =>{
           console.debug(data)
           this.docsReported.splice(index, 1)

           this.$socket.emit('comment:unreport', comment._id)
         })
         .catch(this.$store.$api.errorsHandler.comments.updateComment)
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
    this.$bus.$on('comment:report', this.getReports.bind(this) )

    this.$bus.$on('comment:delete',  this.renderDeleteComment.bind(this))
    this.$bus.$on('comment:unreport',  this.renderUnreportedComment.bind(this))

    this.$bus.$on('user:update:info', this.onUpdateInfos.bind(this))
    this.$bus.$on('user:delete', this.onDeletedUserListeners.bind(this))

    this.getReports()
  },
  beforeDestroy() {
    this.$bus.$off('comment:report', this.getReports.bind(this) )

    this.$bus.$off('comment:delete',  this.renderDeleteComment.bind(this))
    this.$bus.$off('comment:unreport',  this.renderUnreportedComment.bind(this))

    this.$bus.$off('user:update:info', this.onUpdateInfos.bind(this))
    this.$bus.$off('user:delete', this.onDeletedUserListeners.bind(this))
  }
}
</script>

<style scoped>

</style>
