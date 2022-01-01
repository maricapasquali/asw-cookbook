<template>
  <b-container>
    <b-row cols="1" class="my-3">

        <b-alert
            v-for="(doc, index) in docs" :key="index"
            :class="classAlert(doc)" show
            @click.native="clickNotification($event, index)">
          <b-row >
            <b-col>
              <b-row>
                <b-col cols="1" class="mt-2" v-if="!doc.read">
                  <div class="read-badge" />
                </b-col>
                <b-col>
                  <span> {{ doc.content }} </span>
                </b-col>
              </b-row>
            </b-col>
            <b-col cols="2" class="text-right">
              <button :ref="deleteNotificationId(doc._id)" :id="deleteNotificationId(doc._id)" type="button" aria-label="Close" class="close">
                <font-awesome-icon icon="times" size="xs"/>
              </button>
              <b-tooltip :target="deleteNotificationId(doc._id)">Rimuovi</b-tooltip>
            </b-col>
          </b-row>
          <b-row>
            <b-col class="mt-3" class="text-right">
              <small>{{doc.timestamp | dateFormat}}</small>
            </b-col>
          </b-row>
        </b-alert>


    </b-row>
  </b-container>
</template>

<script>
import {bus} from '@/main'
import {mapGetters} from "vuex";
import api from '@api'
import {dateFormat} from "@services/utils";

export default {
  name: "notifications-section",
  data(){
    return {
      docs: [],
      totals: 0,
      pagination: {
        currentPage: 1,
        limit: 3,
        isBusy: false
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
    ...mapGetters(['userIdentifier', 'accessToken','isAdmin']),
  },
  filters: {
    dateFormat
  },
  methods: {
    deleteNotificationId(id){
      return 'close-' + id
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
          if (doc.otherInfo.recipe.shared) return {
            name: 'single-recipe',
            params: {id: doc.otherInfo.recipe.owner, recipe_id: doc.otherInfo.recipe._id},
            hash: doc.otherInfo.comment ? '#comment-' + doc.otherInfo.comment._id : undefined
          }
          return {name: 'p-user-recipes', query: {tab: (this.userIdentifier === doc.otherInfo.recipe.owner ? 'saved':  'shared-in-chat') }}

        case 'comment':
          return { name: 'single-recipe', params: { id: doc.otherInfo.recipe.owner, recipe_id: doc.otherInfo.recipe._id }, hash: '#comment-'+doc.otherInfo.comment._id }

        case 'report':
          if(this.isAdmin) return { name: 'p-user-reports' , params: { id: this.userIdentifier } , hash: '#reported-comment-'+doc.otherInfo.comment._id}
          return { name: 'single-recipe', params: { id: doc.otherInfo.recipe.owner, recipe_id: doc.otherInfo.recipe._id }, hash: '#comment-'+doc.otherInfo.comment._id }

        case 'like':
          if(doc.otherInfo.comment) return { name: 'single-recipe',
                                             params: { id: doc.otherInfo.owner, recipe_id: doc.otherInfo.recipe },
                                             hash: '#comment-' + doc.otherInfo.comment}
          else return doc.otherInfo.liker? { name: 'single-user', params: { id: doc.otherInfo.liker } } : ''

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

      api.notifications
         .getNotifications(this.userIdentifier, this.accessToken)
         .then(({data}) => {
            this.docs = data.items
            this.totals = data.totals
         })
          //TODO: HANDLER ERROR GET NOTIFICATIONS
         .catch(err => console.error(err))

    },

    clickNotification(event, index){
      const target = event.target
      const document = this.docs[index]
      const id = this.deleteNotificationId(document._id)
      const removeBtn = this.$refs[id][0]

      if(removeBtn === target || removeBtn.contains(target)) {
        this.deleteNotification(index)
      }
      else {
        if(!document.read) this.updateNotification(document)
        if(this.isClickableNotification(document.type)) {
          let route = this.route(document);
          if (route) this.$router.push(route)
        }
      }
    },

    updateNotification(doc){
      console.log(doc._id + ' mark as read .')
      api.notifications
         .updateNotification(this.userIdentifier, doc._id, {read: true}, this.accessToken)
         .then(({data}) => {
              doc.read = true
              console.log(data)
         })
         //TODO: HANDLER ERROR UPDATE NOTIFICATION
         .catch(err => {
           doc.read = false
           // doc.read = !doc.read
           console.error(err)
         })
    },

    deleteNotification(index){
      let notificationID =  this.docs[index]._id
      console.log('Delete: ', notificationID)
      // this.docs.splice(index, 1)
      api.notifications
         .deleteNotification(this.userIdentifier, notificationID, this.accessToken)
         .then(({data}) => this.docs.splice(index, 1))
          //TODO: HANDLER ERROR DELETE NOTIFICATION
         .catch(err => console.error(err))
    },

    addNotification(notification){
      console.debug('Add notification: ', notification)
      if(notification) this.docs.unshift(notification)
    }
  },
  created() {
    this.getNotifications()

    for (const eventName of this.events) {
      bus.$on(eventName, this.addNotification.bind(this))
    }
  },
  beforeDestroy() {
    for (const eventName of this.events) {
      bus.$off(eventName, this.addNotification.bind(this))
    }
  }
}
</script>

<style lang="scss" scoped>
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