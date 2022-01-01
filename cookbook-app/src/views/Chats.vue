<template>
  <b-container fluid>
    <h1 class="mb-4"> Chat Room </h1>
    <b-row cols="1" cols-sm="2">
      <b-col sm="8">
        <b-row cols="1" class="mx-auto">
          <b-col v-if="writeUser.typing" class="px-0 my-3">
            <strong>{{ writeUser.userID }}</strong> sta scrivendo <b-icon-three-dots animation="cylon" class="pt-2" />
          </b-col>

          <b-col class="messages-container">
            <b-row v-for="(mex,index) in messages" :key="index" cols="1" class="message my-2 p-2">
              <b-col>
                <b-row align-v="center" align-h="between">
                  <b-col class="text-left"> <strong>{{ mex.user.userID }}</strong></b-col>
                  <b-col class="text-right"><small>{{ mex.timestamp | dateFormat }}</small></b-col>
                </b-row>
              </b-col>
              <b-col>{{ mex.content }}</b-col>
            </b-row>
          </b-col>

          <b-col class="my-3 px-0">

            <b-input-group>
              <b-form-input v-model="message" @input="sendTyping" @keypress.enter="sendMessage"/>
              <b-input-group-append v-if="message">
                <b-button @click="sendMessage" variant="primary">
                  Invia
                </b-button>
              </b-input-group-append>
            </b-input-group>
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

import {dateFormat} from "../services/utils";
import {mapGetters} from "vuex";
export default {
  name: "Chats",
  data(){
    return {
      users: [],
      message: '',
      messages: [],
      writeUser: {
        userID: '',
        typing: false
      }
    }
  },
  filters: {
    dateFormat: function (timestamp){
      return dateFormat(timestamp, 'it', true)
    }
  },
  computed: {
    ...mapGetters({ socket_chat: 'socket' }),
    userName(){
      return this.$store.state.user || {userID: 'Anonymous'}
    }
  },
  methods: {
    sendMessage(){
      if(this.message){
        let mex =  {
          user: this.userName,
          content: this.message,
          timestamp: Date.now()
        }
        this.messages.push(mex)
        this.socket_chat.emit('chat:message', mex)
        this.message = ''
        this.sendTyping()
      }
    },

    receiveMessage(data){
      this.messages.push(data)
    },

    sendTyping(){
      this.socket_chat.emit('chat:typing', { userID: this.userName.userID, typing: this.message.length > 0 })
    },

    receiveTyping(data){
      this.writeUser = data
    },

    updateUsers(data){
      this.users = data
      console.debug('Users in chat rooms : ', JSON.stringify(data))
    }
  },
  created() {
    this.socket_chat.on('enter', this.updateUsers.bind(this))
    this.socket_chat.on('leave', this.updateUsers.bind(this))
    this.socket_chat.on('message', this.receiveMessage.bind(this))
    this.socket_chat.on('typing', this.receiveTyping.bind(this))
    this.socket_chat.emit('chat:enter')
  },
  beforeDestroy() {
    this.socket_chat.off('enter', this.updateUsers.bind(this))
    this.socket_chat.off('leave', this.updateUsers.bind(this))
    this.socket_chat.off('message', this.receiveMessage.bind(this))
    this.socket_chat.off('typing', this.receiveTyping.bind(this))
    this.socket_chat.emit('chat:leave')
  }
}
</script>

<style lang="scss" scoped>
.messages-container{
  background: #007bff;
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