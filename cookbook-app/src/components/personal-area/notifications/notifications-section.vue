<template>
    <b-container>
      <b-row cols="1" class="my-3">
        <b-col v-if="haveNotifications" class="px-0">
          <b-container>
            <b-row class="mt-5">
              <b-col class="px-0" :cols="searchingMode ? 10: 12">
                <b-form-group label-for="type-search" aria-label="Tipo di notifica">
                  <b-input-group>
                    <b-input-group-prepend>
                      <b-input-group-text> <b-icon-search /> </b-input-group-text>
                    </b-input-group-prepend>
                    <b-form-select id="type-search" v-model="filter.type" :disabled="pagination.isBusy" >
                      <template #first>
                        <b-form-select-option value="" disabled> Seleziona un opzione di ricerca </b-form-select-option>
                      </template>
                      <template #default>
                        <b-form-select-option v-for="type in notificationTypes" :key="type.value" :value="type.value"> {{type.text}} </b-form-select-option>
                      </template>
                    </b-form-select>
                  </b-input-group>
                </b-form-group>
              </b-col>
              <b-col class="text-right px-0" v-if="searchingMode" :cols="searchingMode ? 2: 0">
                <b-button title="Reset filtri" variant="secondary" @click="filter.type=''">
                  <font-awesome-icon icon="undo" />
                </b-button>
              </b-col>
            </b-row>
          </b-container>
        </b-col>
        <b-col class="px-0">
          <b-table id="notifications-table"
                   :items="docs"
                   :fields="fields"
                   :per-page="pagination.limit"
                   :current-page="pagination.currentPage"
                   :busy.sync="pagination.isBusy"
                   :filter="filter"
                   :filter-function="filterNotification"
                   @filtered="onFiltered"
                   @row-clicked="clickNotification"
                   show-empty
                   borderless>

            <template #head(_id)="data">
              <div>
                <span class="sr-only"> Notifica </span>
                <strong v-if="searchingMode">Risultati di "{{ textTypeFilter(filter.type) }}" : </strong>
              </div>
            </template>

            <template #cell(_id)="row">
              <b-alert :class="classAlert(row.item)" show>
                <b-container>
                  <b-row>
                    <b-col>
                      <b-row>
                        <b-col cols="1" class="mt-2" v-if="!row.item.read">
                          <div class="read-badge" />
                        </b-col>
                        <b-col>
                          <span> {{ row.item.content }} </span>
                        </b-col>
                      </b-row>
                    </b-col>
                    <b-col cols="2" class="text-right">
                      <button title="Rimuovi" @click="deleteNotification(row.index)" type="button" aria-label="Close" class="close">
                        <font-awesome-icon icon="times" size="xs"/>
                      </button>
                    </b-col>
                  </b-row>
                  <b-row>
                    <b-col class="text-right mt-3">
                      <small>{{row.item.timestamp | dateFormat}}</small>
                    </b-col>
                  </b-row>
                </b-container>
              </b-alert>
            </template>

            <template #empty>
              <span>Non ci sono notifiche.</span>
            </template>

            <template #emptyfiltered>
              <span>Non ci sono notifiche.</span>
            </template>

            <template #table-busy>
              <div class="text-center text-primary my-2">
                <b-spinner class="align-middle"></b-spinner>
                <strong class="ml-2">Caricamento...</strong>
              </div>
            </template>

          </b-table>
        </b-col>
        <b-col class="px-0" v-show="pagination.totalRows">
          <b-pagination v-model="pagination.currentPage"
                        :total-rows="pagination.totalRows"
                        :per-page="pagination.limit"
                        aria-controls="notifications-table"
                        align="fill"/>
        </b-col>
      </b-row>
    </b-container>
</template>

<script>

import {mapGetters} from "vuex";
import {QueuePendingRequests} from "@api/request";

export default {
  name: "notifications-section",
  data(){
    return {
      docs: [],
      fields: [{ key: '_id' }],

      pagination: {
        currentPage: 1,
        limit: 10,
        isBusy: false,
        totalRows: 0
      },

      notificationTypes: [],

      filter: {
        type: ''
      },

      events: [
        'user:update:password',
        'user:strike',

        'friendship:request',
        'friendship:update',
        'friendship:remove',

        'food:create',

        'comment:response',
        'comment:report',

        'like:recipe',
        'like:comment',

        'recipe:comment',
        'recipe:create',
        'recipe:update',
        'recipe:delete',
      ]
    }
  },
  computed: {
    ...mapGetters({
      userIdentifier: 'session/userIdentifier',
      isAdmin: 'session/isAdmin',
      isSigned: 'session/isSigned'
    }),

    haveNotifications(){
      return this.docs.length > 0
    },

    searchingMode(){
      return this.filter.type.length > 0
    }
  },
  filters: {
    dateFormat: function (text){
      return dateFormat(text)
    }
  },
  methods: {
    filterNotification(notification){
      return !this.searchingMode || notification.type === this.filter.type
    },

    onFiltered(filteredItems){
      this.pagination.totalRows = filteredItems.length
      this.pagination.currentPage = 1
    },

    textTypeFilter(filterType){
      return this.notificationTypes.find(t => t.value === filterType)?.text
    },

    classAlert(doc){
      return [
        'col',
        'mb-0',
        'notification',
         this.notificationColor(doc.type)
      ]
    },
    isClickableNotification(type){
      return ['friendship', 'food', 'recipe', 'comment', 'report', 'like', 'user-info'].includes(type)
    },
    route(doc){
      switch (doc.type) {
        case 'friendship':
          return { name: 'p-user-friends', params: { id: this.userIdentifier } }

        case 'food':
          return { name: 'p-user-foods', params: { id: this.userIdentifier } }

        case 'recipe':
          if(doc.otherInfo.recipe.deleted) return ''
          if (doc.otherInfo.recipe.shared || !doc.otherInfo.updaterUser) return {
            name: 'single-recipe',
            params: {id: doc.otherInfo.recipe.owner, recipe_id: doc.otherInfo.recipe._id},
            hash: doc.otherInfo.comment ? '#comment-' + doc.otherInfo.comment._id : undefined
          }
          return {name: 'p-user-recipes', query: {tab: (this.userIdentifier === doc.otherInfo.recipe.owner ? 'saved':  'shared-in-chat') }}

        case 'comment':
          return {
            name: 'single-recipe',
            params: { id: doc.otherInfo.recipe.owner._id, recipe_id: doc.otherInfo.recipe._id },
            hash: '#comment-'+doc.otherInfo.comment._id
          }

        case 'report':
          if(this.isAdmin) return { name: 'p-user-reports' , params: { id: this.userIdentifier } , hash: '#reported-comment-'+doc.otherInfo.comment._id}
          return { name: 'single-recipe', params: { id: doc.otherInfo.recipe.owner, recipe_id: doc.otherInfo.recipe._id }, hash: '#comment-'+doc.otherInfo.comment._id }

        case 'like':
          return {
            name: doc.otherInfo.recipe.owner ? 'single-recipe' : 'recipe',
            params: { id: doc.otherInfo.recipe.owner, recipe_id: doc.otherInfo.recipe._id },
            hash: doc.otherInfo.comment ? '#comment-' + doc.otherInfo.comment._id : ''
          }

        case 'user-info':
          return { name: 'p-user-account' , params: { id: this.userIdentifier } }

        default:
          return '';
      }
    },

    notificationColor(type){
      switch (type) {
        case 'friendship':
          return 'notification-friendship'
        case 'food':
          return 'notification-food'
        case 'recipe':
          return 'notification-recipe'
        case 'comment':
          return 'notification-comment'
        case 'report':
          return 'notification-report'
        case 'like':
          return 'notification-like'
        case 'user-info':
          return 'notification-user-info'
        case 'strike':
          return 'notification-strike'
        default:
          return ''
      }
    },

    getNotifications(){
      let _id = 'notifications-all'
      let options = QueuePendingRequests.makeOptions(this.pendingRequests, _id)

      this.pagination.isBusy = true
      this.$store.dispatch('notifications/all', {options})
          .then(({data}) => {
            this.docs = data.items
            this.pagination.totalRows = data.total
            return true
          })
          .catch(err => {
           this.handleRequestErrors.notifications.getNotifications(err)
           return false
          })
          .then(processEnd => this.pagination.isBusy = !processEnd)
          .then(() => this.pendingRequests.remove(_id))
    },

    clickNotification(document){
      if(!document.read) this.updateNotification(document)
      if(this.isClickableNotification(document.type)) {
        let route = this.route(document);
        if (route) this.$router.push(route)
      }
    },

    updateNotification(doc){
      console.log(doc._id + ' mark as read .')
      this.$store
          .dispatch('notifications/read', doc._id)
          .then(({data}) => {
              doc.read = true
              console.log(data)
          })
          .catch(err => {
            doc.read = false // doc.read = !doc.read
            this.handleRequestErrors.notifications.updateNotification(err)
          })
    },

    deleteNotification(index){
      let notification =  this.docs[index]
      console.log('Delete: ', notification._id)
      this.$store
          .dispatch('notifications/remove', notification)
          .then(({data}) => {
            this.docs.splice(index, 1)
          })
          .catch(this.handleRequestErrors.notifications.deleteNotification)
    },

    addNotification(notification){
      console.debug('Add notification: ', notification)
      if(notification) this.docs.unshift(notification)
    },

    setNotificationsType(){
      this.notificationTypes = [
        { text: "Cibo", value: "food" },
        { text: "Segnalazioni", value: "report" },
        { text: "Informazioni utente", value: "user-info" },
      ]
      if(this.isSigned){
        this.notificationTypes.push({ text: "Amicizia", value: "friendship" })
        this.notificationTypes.push({ text: "Ricette", value: "recipe" })
        this.notificationTypes.push({ text: "Likes", value: "like" })
        this.notificationTypes.push({ text: "Commenti", value: "comment" })
        this.notificationTypes.push({ text: "Strike", value: "strike" })
      }
    }
  },
  created() {
    this.pendingRequests = QueuePendingRequests.create()

    this.setNotificationsType()

    this.getNotifications()

    for (const eventName of this.events) {
      this.$bus.$on(eventName, this.addNotification.bind(this))
    }
  },
  beforeDestroy() {
    this.pendingRequests.cancelAll('all notifications cancel')
    for (const eventName of this.events) {
      this.$bus.$off(eventName, this.addNotification.bind(this))
    }
  }
}
</script>

<style lang="scss" scoped>

::v-deep .table thead th {
  padding-left: 0!important;
}

::v-deep .table tbody td {
  padding: 0!important;
}

.read-badge {
  background-color: $component-color;
  border-radius: 30px;
  width: 10px;
  height: 10px;
}

.notification{
  cursor: pointer;
}

</style>
