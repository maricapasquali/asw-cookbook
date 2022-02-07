<template>
  <div v-if="isLoggedIn && isSigned && isNotMe" >
    <b-modal v-model="deleteFriend" title="Cancella amico" ok-only @ok="sendRemoveFriendShip" centered>
      Sei sicura/o di voler smette di seguire <strong><em>{{otherUser.userID}}</em></strong>?
    </b-modal>
    <b-button-group vertical>
      <b-button-group class="friends-buttons" >
        <b-button variant="danger" v-if="justFollow" @click="deleteFriend = true">Smetti di seguire</b-button>
        <b-button class="request-send" v-else-if="requestJustSend" variant="primary" disabled>Richiesta inviata</b-button>
        <b-button-group v-else-if="requestToUpdate">
          <b-button variant="danger" class="reject-request" @click="rejectRequest">Rifiuta</b-button>
          <b-button variant="primary" class="accept-request" @click="acceptRequest">Accetta</b-button>
        </b-button-group>
        <b-button class="request-reject" v-else-if="requestRejected" variant="danger" disabled>Richiesta rifiutata</b-button>
        <b-button variant="success" v-else-if="!noFollowButton" @click="sendRequestFriendShip">Segui</b-button>
      </b-button-group>

      <b-button :id="chatId" v-if="withChat && isMyFriend" variant="secondary" @click="_goToChat(otherUser._id)">
        <b-icon-chat-fill/>
      </b-button>
      <b-tooltip v-if="withChat && isMyFriend" :target="chatId"> Chat con <strong>{{otherUser.userID}}</strong></b-tooltip>
    </b-button-group>
  </div>
</template>

<script>
import api from '@api'
import {mapGetters} from "vuex";
import {_goToChat} from '@components/chats/utils'

export default {
  name: "b-friendship",
  props: {
    otherUser: {
      type: Object,
      required: true
    },
    withChat: Boolean,
    noFollowButton: Boolean
  },
  data(){
    return {
      deleteFriend: false,

      requestToUpdate: false,
      requestJustSend: false,
      justFollow: false,
      requestRejected: false,
      isMyFriend: false,
    }
  },
  watch: {
    otherUser(vl){
      console.debug('friendship: set other user => ', vl._id)
      this.onCheckFriendshipState(vl)
    }
  },
  computed: {
    ...mapGetters({
      accessToken: 'session/accessToken',
      userIdentifier: 'session/userIdentifier',
      isLoggedIn: 'session/isLoggedIn',
      isSigned: 'session/isSigned'
    }),

    chatId(){
      return 'btn-chat-' + this.otherUser._id
    },

    isNotMe(){
      return this.otherUser._id !== this.userIdentifier
    },

    isAccessibleArea(){
      return ['single-user', 'search'].includes(this.$route.name)
    }
  },
  methods: {

    // POST
    sendRequestFriendShip(){
      api.friends
          .requestFriendShip(this.otherUser._id, this.accessToken)
          .then(({ data }) => {
            console.log('Request friendship pending. ')
            this.$socket.emit('friendship:request', data)
            return true
          })
          .catch(err => this.handleRequestErrors.friends.requestFriendShip(err, { _forbiddenPage: !this.isAccessibleArea }))
          .then(duplicate => this.requestJustSend = duplicate)
    },

    // DELETE
    sendRemoveFriendShip(){
      api.friends
          .breakFriendShip(this.userIdentifier, this.otherUser._id, this.accessToken)
          .then(({data}) => {
            console.log('Friendship is over. ')
            this.justFollow = false
            this.isMyFriend = false
            this.$socket.emit('friendship:remove', this.otherUser)
          })
          .catch(err => this.handleRequestErrors.friends.breakFriendShip(err, { _forbiddenPage: !this.isAccessibleArea }))
    },

    //UPDATE
    _updateFriendShip(state){
      api.friends
          .updateFriendShip(this.userIdentifier, this.otherUser._id, { state: state }, this.accessToken)
          .then(({data}) => {
            console.log('State friendship is '+state+'. ')
            this.$socket.emit('friendship:update', data)
            return state
          })
          .catch(err => this.handleRequestErrors.friends.updateFriendShip(err, { _forbiddenPage: !this.isAccessibleArea }))
          .then(actualState => {
            if(actualState){
              this.requestToUpdate = false
              this.requestRejected = actualState === 'rejected'
              this.justFollow = actualState === 'accepted'
              this.isMyFriend = this.justFollow
            }
          })
    },
    rejectRequest(){
      return this._updateFriendShip('rejected')
    },
    acceptRequest(){
      return this._updateFriendShip('accepted')
    },

    setFriendShip(vl, data){
      if(data){
        console.debug('other user = ', vl , ', friendship = ', data)
        this.requestToUpdate = (data.from === vl._id && data.to === this.userIdentifier) && data.state === 'pending'
        this.requestJustSend = (data.from === this.userIdentifier && data.to === vl._id) && data.state === 'pending'
        let filter = (data.from === this.userIdentifier && data.to === vl._id) || (data.from === vl._id && data.to === this.userIdentifier)
        this.justFollow = filter && data.state === 'accepted'
        this.requestRejected = filter && data.state === 'rejected'
        this.isMyFriend = (data.from === vl._id || data.to === vl._id) && data.state === 'accepted'
      }
    },
    onCheckFriendshipState(vl){
       if(vl){
         this.$socket.emit('check:user:friendship', vl._id)
         this.$socket.on('friendship:state:'+ vl._id, this.setFriendShip.bind(this, vl))
       }
    },

    /* chat */
    _goToChat,

    /* Listeners notification */
    onListenFriendshipRequest(notification){
      let _id = notification.otherInfo.from

      if(this.otherUser._id === _id) {
        this.requestToUpdate = true

        this.requestJustSend = false
        this.justFollow = false
        this.requestRejected = false
        this.isMyFriend = false
      }
      this.$emit('add-friend')
    },
    onListenFriendshipUpdate(notification){
      let {state, to: user } = notification.otherInfo

      if(this.otherUser._id === user) {

        this.requestRejected = state === 'rejected'
        this.justFollow = state === 'accepted'
        this.isMyFriend = this.justFollow

        this.requestToUpdate = false
        this.requestJustSend = false
      }
    },
    onListenFriendshipRemove(notification){
      let _id = notification.otherInfo.exFriend
      if(this.otherUser._id === _id) {
        this.requestToUpdate = false
        this.requestJustSend = false
        this.justFollow = false
        this.requestRejected = false
        this.isMyFriend = false
      }
      this.$emit('remove-friend')
    }
  },
  mounted() {
    console.debug('mounted b-friendship')
    this.onCheckFriendshipState(this.otherUser)
    this.$bus.$on('friendship:request:' + this.otherUser._id, this.onListenFriendshipRequest.bind(this))
    this.$bus.$on('friendship:update:' + this.otherUser._id, this.onListenFriendshipUpdate.bind(this))
    this.$bus.$on('friendship:remove:' + this.otherUser._id, this.onListenFriendshipRemove.bind(this))
  },
  beforeDestroy() {
    this.$bus.$off('friendship:request:' + this.otherUser._id, this.onListenFriendshipRequest.bind(this))
    this.$bus.$off('friendship:update:' + this.otherUser._id, this.onListenFriendshipUpdate.bind(this))
    this.$bus.$off('friendship:remove:' + this.otherUser._id, this.onListenFriendshipRemove.bind(this))
  }
}
</script>

<style lang="scss" scoped>
</style>