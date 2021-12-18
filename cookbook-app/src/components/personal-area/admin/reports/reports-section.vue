<template>
  <b-container fluid>
    <b-row cols="1">
      <b-col class="my-4"> <strong>Commenti segnalati</strong> </b-col>
      <b-col>
        <span v-if="!docsReported.length"> Nessun commento segnalato.</span>
        <b-row v-else cols="1" cols-sm="1" cols-md="2" cols-lg="3" cols-xl="4">
          <b-col v-for="(doc, index) in docsReported" :key="doc._id" class="mb-2">
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

import api from '@api'

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
    ...mapGetters(['accessToken'])
  },
  methods: {
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
         })
          //TODO: HANDLER ERROR UNREPORTED COMMENT WITH admin
         .catch(err => console.error(err))
    }
  },
  mounted() {
    this.getReports()
  }
}
</script>

<style scoped>

</style>