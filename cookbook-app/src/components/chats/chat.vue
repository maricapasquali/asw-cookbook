<template>
  <b-container v-if="isLoggedIn" fluid class="chat" >
    <b-row cols="1" class="px-0">
      <b-col ref="chat-header" class="messages-header text-center px-0">
        <b-col>
          <chat-header v-model="value" @on-user-enter="enterChat" @on-user-leave="leaveChat({leaveUser: $event})"/>
        </b-col>
        <b-col v-if="writeUsers.length" ref="col-typing" class="messages-typing">
          <chat-typing :users="writeUsers" :group="isChatGroup"/>
        </b-col>
      </b-col>

      <b-col class="messages-container pt-3 pb-4" ref="messages" :style="cssMessages">
        <b-row  id="messages"  class="px-3" cols="1" >
          <b-col  v-for="mex in messages" :key="mex._id" >
            <chat-message :value="mex" :group="isChatGroup" @resend="resendMessage" :attachment-api="getAttachmentsInfo" />
          </b-col>
        </b-row>
      </b-col>


      <b-col ref="chat-footer" v-if="!value || amINotReaderUser" class="messages-footer" >
        <chat-footer :disabled="!value" encrypted @send-text="sendMessage" @typing="sendTyping"
                     :attachments-items="recipes" :attachment="attachment.link" :attachmentPreview="attachment.preview" attachment-search-field="name" @attachment-click="createLinkToSend"
                     @write="onWriteMessage" >

          <template v-slot:attachment-item="{ item }">
            <b-card no-body img-left class="attachment-item" body-class="py-0" style="cursor: pointer">
              <b-row align-v="center" align-h="center">
                <b-col><preview-recipe-image v-model="item.img" /></b-col>
                <b-col>
                  <b-card-body :title="item.name">
                    <b-row align-v="center">
                      <b-col class="pr-1"> <country-image v-model="item.country" heigth="0" :id="item.name"/> </b-col>
                      <b-col class="pl-1"> <span>{{ item.category | recipeCategoryName }}</span> </b-col>
                    </b-row>
                  </b-card-body>
                </b-col>
              </b-row>
            </b-card>
          </template>

          <template #attachment-title>
            <strong>Ricette</strong>
          </template>
        </chat-footer>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import api from '@api'
import {mapGetters, mapMutations} from "vuex";
import {dateFormat} from "@services/utils";
import ChatUtils from '@components/chats/utils'
import {RecipeCategories} from "@services/app";

export default {
  name: "chat",
  props: {
    value: Object | Boolean,
  },
  data(){
    return {
      heightHeader: 100,
      heightFooter: 120,

      heightHeaderWithOffline: 100,
      heightHeaderWithOnline: 75,
      heightFooterWithAttachment: 343,
      heightFooterWithoutAttachment: 120,


      messages: null,

      writeUsers: [],

      recipes: [],
      attachment: { id: '', link:'' , preview: {} },
    }
  },
  filters: {
    dateFormat,
    recipeCategoryName(val){
      let category = RecipeCategories.find(val)
      return category ? category.text : '';
    }
  },
  watch: {
    messages:{
      deep:true,
      handler(val, old){
        if(old) this.$nextTick(() => this._goToTheBottom('smooth'))
      }
    },
    value(val, old) {
      if (!old) this._initialization(val)
    },
    'attachment.link'(val){
      if(val) {
        this.heightFooter = this.heightFooterWithAttachment

        let recipe = this.recipes.find(r => r._id === this.attachment.id)
        if(recipe) this.attachment.preview = this.createObjectPreview(recipe, val)
      }
      else {
        this.heightFooter = this.heightFooterWithoutAttachment

        this.attachment.preview = {}
      }
    },
    writeUsers(val){
      if(val.length) this.heightHeader = this.heightHeaderWithOffline
      else  this.heightHeader = this.heightHeaderWithOnline
    }
  },
  computed: {
    cssMessages(){
      return {
        '--position-top': `${this.heightHeader}px`,
        '--position-bottom':`${this.heightFooter}px`,
      }
    },

    _linkAttachmentInfo(){
      return {
        origin: window.origin,
        pattern: `${this.$route.path}/recipes/*`
      }
    },

    ...mapGetters(['isLoggedIn', 'socket', 'username', 'userIdentifier', 'username', 'accessToken']),

    temporaryNameChat: {
      get(){
        return this.value && this.value.info.tempName
      },
      set(val){
        if(this.value) this.value.info.tempName = val
      }
    },

    withAdmin(){
      return this.value && this._withAdmin(this.value.users)
    },

    isChatGroup(){
      return this.value && this._isChatGroup(this.value.info)
    },

    amINotReaderUser(){
      return this.value && this.value.users.find(u => u.user._id === this.userIdentifier && u.role !== 'reader')
    },

    infoChat(){
      return this.value.info
    },
    usersChat(){
      return this.value.users
    },

    _infoForSocket(){
      return {
        _id: this.value._id,
        info: {
          type:this.value.info.type,
          name: this.value.info.name,
          usersRole: (this.isChatGroup ? this.value.users.filter(r => r.role !== 'reader'): this.value.users)
                        .map(u => ({user: u.user._id, role: u.role}))
        },
        users: this.value.users.map(u => u.user)
      }
    }
  },

  methods: {

    _goToTheBottom(behavior = 'auto'){
      console.debug('Go To The Bottom of the messages : behavior = ', behavior)
      const messagesContainer = document.getElementById('messages');
      if(messagesContainer)
        messagesContainer.scrollTo({ top: messagesContainer.scrollHeight - messagesContainer.clientHeight, behavior: behavior});

    },

    ...ChatUtils,

    _changeStateMyMessage(newStateMessage){
      const myMessages = this.messages.filter(m => m.sender._id === this.userIdentifier)
      const lastMessage = myMessages[myMessages.length-1]
      const index = this.messages.indexOf(lastMessage)
      if(index !== -1) this.messages.splice(index, 1, Object.assign(lastMessage, newStateMessage))
      console.debug('index = ', index, ', all messages = ', this.messages)
    },

    sendTyping(typing = false){
      this.socket.emit('chat:typing', this.temporaryNameChat, { _id: this.userIdentifier, userID: this.isChatGroup && this.username, typing: typing } )
    },
    receiveTyping(data){
      const index = this.writeUsers.findIndex(w => w._id === data._id)
      if (data.typing){
        if(index ===-1) this.writeUsers.push(data)
      }else {
        const index = this.writeUsers.findIndex(w => w._id === data._id)
        if(index !==-1) this.writeUsers.splice(index, 1)
      }
      console.debug('TYPING container height = ',  data)
    },
    ...mapMutations(['removeUnReadMessage']),
    readMessages(messages, init = false){
      if(messages.length) {
        let messagesIds = messages.map(m => m._id)
        console.log('Read messages = ', messagesIds)
        api.chats
            .messages
            .readMessages(this.userIdentifier, this.value._id, {messages: messagesIds} , this.accessToken)
            .then((response) => {
              console.debug(response)
              if(response.status === 204) return console.debug('Message ('+message._id+') has already read.');
              const {description, readers} = response.data
              const reader = Object.values(readers)[0].user
              messages.forEach(message => {
                message.read.push(readers[message._id])
                if(init) this.removeUnReadMessage()
              })
              console.debug(description, ' from ', reader.userID)
              this.socket.emit('chat:read', this.temporaryNameChat, messages)
            })
            //TODO: HANDLER ERRORS MARK LIKE READ MESSAGE
            .catch(err => console.error(err))
      }
    },
    receiveConfirmReadMessages(messages){
      console.log('Conferm read: ', messages)
      for (const message of messages){
        const index = this.messages.findIndex(m => m._id === message._id)
        if( index !== -1 ) this.messages.splice(index, 1, message)
      }
    },

    resetAttachment(){
      this.attachment = { id:'', link:'', preview: {} }
    },
    sendMessage(message, attachment){
      let _message = message;
      if(typeof message === 'string'){
        _message = {
          sender: { _id: this.userIdentifier },
          content: attachment ? message.replace(attachment, ''): message,
          attachment: attachment,
          timestamp: Date.now(),
          delivered: null
        }
        this.messages.push(_message)
        this.sendTyping()
      }
      console.log('Message to delivered = ', JSON.stringify(_message))

      this.whenAttachmentPresetUpdatePermission()
          .then(() => {
            const data = {
              content: _message.content,
              attachment: _message.attachment ? _message.attachment.replace(this._linkAttachmentInfo.origin, '') : undefined,
              timestamp: _message.timestamp
            }
            api.chats
                .messages
                .createMessage(this.userIdentifier, this.value._id, data, this.accessToken)
                .then(({data}) => {
                  console.debug('Message has been delivered => ', JSON.stringify(data))
                  this._changeStateMyMessage({ ...data, delivered: true })
                  this.socket.emit('chat:messages', this.temporaryNameChat, data)

                  this.resetAttachment()
                })
                //TODO: HANDLER ERROR CREATE MESSAGE
                .catch(err => {
                  this._changeStateMyMessage({ delivered: false })
                  console.error(err)
                })
          })
          .catch((e) => { console.error('NO UPDATE PERMISSION ', e); this._changeStateMyMessage({ delivered: false }); })
    },
    resendMessage(message){ // with message as object
      message.delivered = null
      this.sendMessage(message)
    },
    receiveMessages(messages){
      console.log('Receive messages = ', messages)
      messages.filter(message => message.attachment).forEach(message =>message.attachment = `${window.origin}${message.attachment}`)
      this.messages.push(...messages)
      this.readMessages(messages)
    },

    enterChat({chatName, enteredUser}){
      this.heightHeader = this.heightHeaderWithOnline

      if(chatName && enteredUser){
        this.temporaryNameChat = chatName
        console.log('User ', enteredUser, ' enter in chat : ', this.temporaryNameChat)
      }
    },
    leaveChat({chatName, leaveUser}){
      this.heightHeader = this.heightHeaderWithOffline

      if(chatName) console.log('User ', leaveUser, ' leave chat : ', chatName)
      const index = this.writeUsers.findIndex(w => w._id === leaveUser)
      if(index !==-1) this.writeUsers.splice(index, 1)
    },

    _initialization(chat){
      if(chat) {
        this.socket.emit('chat:enter', this._infoForSocket)

        this.messages = chat.messages.map(message => Object.assign(message, {delivered: true}))

        const unReadMessage = this.messages.filter(m => m.sender._id !== this.userIdentifier && !m.read.find(r => r.user._id === this.userIdentifier))
        this.readMessages(unReadMessage.reverse(), true)

        this.$nextTick(() => this._goToTheBottom())

        console.debug('Initialization chat info = ', JSON.stringify(chat.info, null,1))
        console.debug('Initialization chat users = ', JSON.stringify(chat.users, null,1))

        if(!this.isAdmin && !this.withAdmin) this.getAttachmentsRecipes()
      }
    },

    /*ATTACHMENTS*/

    _linkAttachment(id){
      return `${window.location}/recipes/${id}`
    },

    getAttachmentsRecipes(){
      api.recipes
         .getRecipes(this.userIdentifier, this.accessToken, 'saved')
         .then(({data}) =>{
           this.recipes = data.items;
           console.debug('Attachments = > ', data.items)
         })
         .catch(err => console.error(err))
    },

    onWriteMessage(val){
      console.debug('onWriteMessage check link ... ')
      if(this.attachment.id){
        let _attachment = this._linkAttachment(this.attachment.id)
        if(val.search(_attachment) === -1) {
          this.attachment.link = ''
          console.debug("remove attachment = ", _attachment)
        } else{
          this.attachment.link = _attachment
          console.debug("re-add attachment = ", _attachment)
        }
      }
    },
    createLinkToSend(recipe){
      this.attachment.id = recipe._id
      this.attachment.link = this._linkAttachment(recipe._id)
      console.debug("attachment = ", this.attachment)
    },

    createObjectPreview(data, link){
      return {
        title: data.name,
        img: data.img,
        description: data.preparation,
        link
      }
    },

    whenAttachmentPresetUpdatePermission(){
      let executor = null
      if(this.attachment.id && this.attachment.link){
        console.debug("WITH attachment = ", this.attachment.link)

        const permission = this.usersChat.filter(r => r.user._id !== this.userIdentifier)
                                         .map(r => ({user: r.user._id, granted: 'read'}))

        executor = (resolve, reject) => api.recipes
                                           .updatePermission(this.userIdentifier, this.attachment.id, permission, this.accessToken)
                                           .then(({data}) => {
                                              console.log(data)
                                              resolve()
                                           })
                                           .catch(err =>{
                                              console.error(err)
                                              reject()
                                           })
      } else {
        console.debug("NO attachment ")
        executor = (resolve, reject) => resolve()
      }
      return new Promise(executor)
    },
    getAttachmentsInfo(link){
      if(link){
        const id = link.split('/').pop()
        if(!id) return new Promise((resolve, reject) => reject({reason: 'Resource id is not valid.', link}))
        return api.recipes
                  .getRecipe(this.userIdentifier, id, null,this.accessToken)
                  .then(({data}) =>{
                    console.debug('Attachments = > ', data)
                    return this.createObjectPreview(data, link)
                  })
                  .catch(err => {
                    console.error(err)
                    return {link}
                  })
      }
    }
  },
  created() {
    this.socket.on('enter', this.enterChat.bind(this))
    this.socket.on('leave', this.leaveChat.bind(this))
    this.socket.on('read-messages', this.receiveConfirmReadMessages.bind(this))
    this.socket.on('typing', this.receiveTyping.bind(this))
    this.socket.on('messages', this.receiveMessages.bind(this))
  },
  mounted() {
    this._initialization(this.value)
  },

  beforeDestroy() {
    this.socket.off('enter', this.enterChat.bind(this))
    this.socket.off('leave', this.leaveChat.bind(this))
    this.socket.off('read-messages', this.receiveConfirmReadMessages.bind(this))
    this.socket.off('typing', this.receiveTyping.bind(this))
    this.socket.off('messages', this.receiveMessages.bind(this))

    this.socket.emit('chat:leave', this._infoForSocket)
  }
}
</script>

<style lang="scss" scoped>
.chat {
  color: black;
  position:absolute;
  top:0;
  bottom:0;
  left:0;
  right:0;
  z-index:-1; /* Remove this line if it's not going to be a background! */

  & .messages-header{
    background-color: $background-color-chat-header;
    box-shadow: 0px 3px 12px 0px #0000006e;
    color: white;

    position: absolute;
    top: 0;
    z-index: 10;

    & .messages-typing{
      background-color: $background-color;
    }

  }

  & .messages-container {
    background-color: $background-color-chat;
    box-sizing: border-box;

    & > div#messages {
      overflow: auto;
      height: 100%;
    }

    position: absolute;
    bottom: var(--position-bottom);
    top: var(--position-top);
  }

  & .messages-footer {
    background-color: white;
    box-shadow: 0px -3px 12px 0px #0000006e;

    position: absolute;
    bottom: 0;
  }
}
</style>