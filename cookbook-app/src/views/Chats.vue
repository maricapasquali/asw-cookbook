<template>
  <b-container fluid>
    <h1 class="mb-4"> Chat Room </h1>
    <b-row cols="1" cols-sm="2">
      <b-col sm="8">
        <b-row cols="1" class="mx-auto">
          <b-col v-if="writeUsers.length" class="px-0 my-3">
            <chat-typing :users="writeUsers" group/>
          </b-col>
          <b-col ref="messages-container" class="messages-container">
            <chat-message class="mx-2" v-for="(mex,index) in messages" :key="index" :value="mex" group/>
          </b-col>
          <b-col class="my-3 px-0">
            <chat-footer @send-text="sendMessage" @typing="sendTyping" />
          </b-col>
        </b-row>
      </b-col>
      <b-col sm="4" class="text-center">
        <section>
          <strong> Utenti in chat: </strong>
          <ul class="users-in-chat-room">
            <li v-for="(user, ind) in users" :key="ind">{{user.userID}}</li>
          </ul>
        </section>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>

import {dateFormat} from "@services/utils";
import {mapGetters} from "vuex";
export default {
  name: "Chats",
  data(){
    return {
      users: [],
      messages: [],
      writeUsers: []
    }
  },
  filters: {
    dateFormat: function (timestamp){
      return dateFormat(timestamp, 'it', true)
    }
  },
  computed: {
    ...mapGetters(["socket", "username", "userIdentifier"]),
    sender(){
      return {_id: this.userIdentifier , userID: this.username}
    }
  },
  methods: {
    goToTheBottom(){
      // const messagesContainer = this.$el.querySelector(".messages-container");
      const messagesContainer = this.$refs['messages-container']
      if(messagesContainer) messagesContainer.scrollTo({ top: messagesContainer.scrollHeight , behavior: 'smooth' });
    },

    sendMessage(message){
      let mex =  {
        sender: this.sender,
        content: message,
        timestamp: Date.now()
      }
      this.messages.push(mex)
      this.socket.emit('chat-room:message', mex)
      this.sendTyping()
    },

    receiveMessage(data){
      this.messages.push(data)
    },

    sendTyping(typing = false){
      this.socket.emit('chat-room:typing', { _id: this.sender._id || this.writeUsers.findIndex(w => !w._id), userID: this.sender.userID, typing })
    },

    receiveTyping(data){
      console.debug('Typing user = ', JSON.stringify(data))
      let index = typeof data._id === 'number' ? data._id : this.writeUsers.findIndex(w => (w._id === data._id))
      if(data.typing){
        if(index === -1) this.writeUsers.push(data)
      }else{
        if(index !== -1) this.writeUsers.splice(index, 1)
      }
    },

    updateUsers(data){
      //TODO: UPDATE LEAVING/ENTER CHAT
      this.users = data
      console.debug('Users in chat rooms : ', JSON.stringify(data))
    }
  },
  updated() {
    this.goToTheBottom()
  },
  created() {
    this.socket.on('enter', this.updateUsers.bind(this))
    this.socket.on('leave', this.updateUsers.bind(this))
    this.socket.on('message', this.receiveMessage.bind(this))
    this.socket.on('typing', this.receiveTyping.bind(this))
    this.socket.emit('chat-room:enter')
  },
  beforeDestroy() {
    this.socket.off('enter', this.updateUsers.bind(this))
    this.socket.off('leave', this.updateUsers.bind(this))
    this.socket.off('message', this.receiveMessage.bind(this))
    this.socket.off('typing', this.receiveTyping.bind(this))
    this.socket.emit('chat-room:leave')
  }
}
</script>

<style lang="scss" scoped>
.messages-container{
  background: $background-color-chat;
  overflow-y: auto;
  height: 500px;
  border-radius: 10px;

  & .message {
    background: white;
  }
}
.users-in-chat-room{
  list-style: none;
  padding: 0;
  & > li {
    background: white;
    padding: 10px;
    border-radius: 5px;
    margin-bottom: 5px;
    margin-top: 5px;
  }
}

</style>