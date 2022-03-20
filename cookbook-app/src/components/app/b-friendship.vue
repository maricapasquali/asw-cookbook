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

      <b-button :title="'Chat con '+otherUser.userID" v-if="withChat && isMyFriend" variant="secondary" @click="_goToChat(otherUser._id)">
        <b-icon-chat-fill/>
      </b-button>
    </b-button-group>
  </div>
</template>

<script>
import {mapGetters} from "vuex";
import ChatMixin from '@components/mixins/chat.mixin'
export default {
  name: "b-friendship",
  mixins: [ChatMixin],
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
  computed: {
    ...mapGetters({
      accessToken: 'session/accessToken',
      userIdentifier: 'session/userIdentifier',
      isLoggedIn: 'session/isLoggedIn',
      isSigned: 'session/isSigned',
      friends: 'friendships/friends'
    }),

    isNotMe(){
      return this.otherUser._id !== this.userIdentifier
    },

    isAccessibleArea(){
      return ['single-user', 'search'].includes(this.$route.name)
    }
  },
  methods: {
    _setActualState(state){
      if(state){
        this.requestToUpdate = false
        this.requestRejected = state === 'rejected'
        this.justFollow = state === 'accepted'
        this.isMyFriend = this.justFollow
      }
    },

    // POST
    sendRequestFriendShip(){
      this.$store.dispatch('friendships/request-to', this.otherUser._id)
          .then(({ data }) => {
            console.log('Request friendship pending. ')
            this.$socket.emit('friendship:request', data)
            return true
          })
          .catch(err => this.handleRequestErrors.friends.requestFriendShip(err, { _forbiddenPage: !this.isAccessibleArea }))
          .then(this._setActualState)
    },

    // DELETE
    sendRemoveFriendShip(){
      this.$store.dispatch('friendships/break-up-with', this.otherUser._id)
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
      this.$store.dispatch('friendships/update-request', {userID: this.otherUser._id, state})
          .then(({data}) => {
            console.log('State friendship is '+state+'. ')
            this.$socket.emit('friendship:update', data)
            return state
          })
          .catch(err => this.handleRequestErrors.friends.updateFriendShip(err, { _forbiddenPage: !this.isAccessibleArea }))
          .then(this._setActualState)
    },
    rejectRequest(){
      return this._updateFriendShip('rejected')
    },
    acceptRequest(){
      return this._updateFriendShip('accepted')
    },

    _renderFriendShip(data){
      let vl = this.otherUser
      console.debug('other user = ', vl , ', friendship = ', data)
      this.requestToUpdate = (data.from?._id === vl._id && data.to?._id === this.userIdentifier) && data.state === 'pending'
      this.requestJustSend = (data.from?._id === this.userIdentifier && data.to?._id === vl._id) && data.state === 'pending'
      let filter = (data.from?._id === this.userIdentifier && data.to?._id === vl._id) || (data.from?._id === vl._id && data.to?._id === this.userIdentifier)
      this.justFollow = filter && data.state === 'accepted'
      this.requestRejected = filter && data.state === 'rejected'
      this.isMyFriend = (data.from?._id === vl._id || data.to?._id === vl._id) && data.state === 'accepted'
    },
    _setFriendShip(friends){
      let _friends = friends || this.friends || []
      _friends.filter(f => (f.from?._id === this.otherUser._id || f.to?._id === this.otherUser._id))
              .forEach(data => { if(data) this._renderFriendShip(data)})
    },

    /* Listeners notification */
    onListenFriendshipRequest(notification){
      let _idFrom = notification.otherInfo.from
      let _idTo = notification.otherInfo.to

      if(this.otherUser._id === _idFrom) {
        this.requestToUpdate = true

        this.requestJustSend = false
        this.justFollow = false
        this.requestRejected = false
        this.isMyFriend = false
      }
      else if(this.otherUser._id === _idTo){
        this.requestJustSend = true

        this.requestToUpdate = false
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
  created() {
    if(this.isLoggedIn){
      if(this.friends.length === 0) {
        this.$store.dispatch('friendships/own')
            .then(({data}) => this._setFriendShip())
            .catch(this.handleRequestErrors.friends.getFriendOf)
      }
      else this._setFriendShip()
    }

    console.debug('created b-friendship')
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
