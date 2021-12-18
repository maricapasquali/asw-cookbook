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
        <b-button variant="success" v-else @click="sendRequestFriendShip">Segui</b-button>
      </b-button-group>

<!--      <b-button variant="secondary" @click=""> Chat </b-button>-->
      <b-button :id="chatId" v-if="withChat && isMyFriend" variant="secondary"> <b-icon-chat-fill/> </b-button>
      <b-tooltip v-if="withChat && isMyFriend" :target="chatId"> Chat con <strong>{{otherUser.userID}}</strong></b-tooltip>
    </b-button-group>
  </div>
</template>

<script>
import api from '@api'
import {mapGetters} from "vuex";

export default {
  name: "b-friendship",
  props: {
    otherUser: {
      type: Object,
      required: true
    },
    withChat: Boolean
  },
  data(){
    return {
      deleteFriend: false,
    }
  },
  computed: {
    ...mapGetters(['accessToken', 'userIdentifier', 'isLoggedIn', 'isSigned', 'userFriends']),

    chatId(){
      return 'btn-chat-' + this.otherUser._id
    },

    requestToUpdate(){
      return this.userFriends && this.userFriends.find(f => (f.from._id === this.otherUser._id && f.to._id === this.userIdentifier) && f.state === 'pending')
    },
    requestJustSend(){
      return this.userFriends && this.userFriends.find(f => (f.from._id === this.userIdentifier && f.to._id === this.otherUser._id) && f.state === 'pending')
    },

    justFollow(){
      return this._justUpdated('accepted')
    },
    requestRejected(){
      return this._justUpdated( 'rejected')
    },

    isNotMe(){
      return this.otherUser._id !== this.userIdentifier
    },

    isMyFriend(){
      return this.userFriends && this.userFriends.find(f => (f.from._id === this.otherUser._id || f.to._id === this.otherUser._id) && f.state === 'accepted')
    }

  },
  methods: {
    _justUpdated(state){
      let filter = (f) => (f.from._id === this.userIdentifier && f.to._id === this.otherUser._id)  ||
                          (f.from._id === this.otherUser._id && f.to._id === this.userIdentifier)
      return this.userFriends && this.userFriends.find(f => filter(f) && f.state === state)
    },

    // POST
    sendRequestFriendShip(){
      api.friends
          .requestFriendShip(this.otherUser._id, this.accessToken)
          .then(({ data }) => {
            console.log('Request friendship pending. ')
            this.$store.commit('pushFriend', data)
          })
          //TODO: HANDLER ERROR ADD FRIENDSHIP
          .catch(err => console.error(err))
    },

    // DELETE
    sendRemoveFriendShip(){
      api.friends
          .breakFriendShip(this.userIdentifier, this.otherUser._id, this.accessToken)
          .then(({data}) => {
            console.log('Friendship is over. ')
            this.$store.commit('popFriend', this.otherUser._id)
          })
          //TODO: HANDLER ERROR DELETE FRIENDSHIP
          .catch(err => console.error(err))
    },

    //UPDATE
    _updateFriendShip(state){
      api.friends
          .updateFriendShip(this.userIdentifier, this.otherUser._id, { state: state }, this.accessToken)
          .then(({data}) => {
            console.log('State friendship is '+state+'. ')
            this.$store.commit('updateFriend', data)
          })
          //TODO: HANDLER ERROR UPDATE FRIENDSHIP
          .catch(err => console.error(err))
    },
    rejectRequest(){
      return this._updateFriendShip('rejected')
    },
    acceptRequest(){
      return this._updateFriendShip('accepted')
    }
  }
}
</script>

<style lang="scss" scoped>
.friends-buttons{

  & > .request-send {
      //color: #80bdff;
  }
  & > .request-reject {
      //color: red;
  }
}
</style>