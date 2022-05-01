<template>
    <b-container>
      <b-row cols="1" class="my-3">
        <b-col v-if="haveNotifications" class="px-0">
          <b-container>
            <b-row class="mt-5">
              <b-col class="px-0" :cols="searchingMode ? 10: 12">
                <b-form-group label-for="type-search" aria-label="Tipo di notifica">
                  <b-input-group>
                    <custom-select id="type-search" v-model="filter.type" :options="notificationTypes" placeholder="Seleziona un opzione di ricerca" :disabled="pagination.isBusy">
                      <template #icon-prepend> <b-icon-search /></template>
                    </custom-select>
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
              <b-alert class="col mb-0 notification" :variant="notificationColor(row.item.type)" show>
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
                      <b-button-close title="Rimuovi" @click="deleteNotification(row.index)"></b-button-close>
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
import {PendingRequestMixin} from "@mixins"

export default {
  name: "notifications-section",
  mixins: [PendingRequestMixin],
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
      return this.filter.type?.length > 0
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
      let options = this.makeRequestOptions(_id)

      this.pagination.isBusy = true
      this.$store.dispatch('notifications/all', {options})
          .then(({data}) => {
            this.docs = data.items
            this.pagination.totalRows = data.total
            return true
          })
          .catch(err => {
           this.$store.$api.errorsHandler.notifications.getNotifications(err)
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
      console.debug(doc._id + ' mark as read .')
      this.$store
          .dispatch('notifications/read', doc._id)
          .then(({data}) => {
              doc.read = true
              console.debug(data)
          })
          .catch(err => {
            doc.read = false // doc.read = !doc.read
            this.$store.$api.errorsHandler.notifications.updateNotification(err)
          })
    },

    deleteNotification(index){
      let notification =  this.docs[index]
      console.debug('Delete: ', notification._id)
      this.$store
          .dispatch('notifications/remove', notification)
          .then(({data}) => {
            this.docs.splice(index, 1)
          })
          .catch(this.$store.$api.errorsHandler.notifications.deleteNotification)
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
    this.setNotificationsType()

    this.getNotifications()

    for (const eventName of this.events) {
      this.$bus.$on(eventName, this.addNotification.bind(this))
    }
  },
  beforeDestroy() {
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

.alert-notification-friendship {
  color: #6d0085;
  background-color: #ecccff;
  border-color: #e3b8ff;
}

.alert-notification-food {
  color: #008512;
  background-color: #d3ffcc;
  border-color: #bfffb8;
}

.alert-notification-recipe {
  color: #008562;
  background-color: #ccffe0;
  border-color: #b8ffd9;
}

.alert-notification-comment {
  color: #001685;
  background-color: #ccd3ff;
  border-color: #b8c6ff;
}

.alert-notification-report{
  color: #850000;
  background-color: #ffccd2;
  border-color: #ffb8ba;
}

.alert-notification-like{
  color: #853300;
  background-color: #ffe1cc;
  border-color: #ffcdb8;
}

.alert-notification-user-info{
  color: #343434;
  background-color: #f6f6f6;
  border-color: #d9d9d9;
}

.alert-notification-strike{
  color: #856404;
  background-color: #fff3cd;
  border-color: #ffeeba;
}

</style>
