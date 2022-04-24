<template>
  <b-container v-if="isLoggedIn" :fluid="!fromLink">
    <b-row cols="1" :class="classContainer">
      <b-col>
        <b-row cols="1" class="chat h-100 px-0" >
          <b-col ref="chat-header" class="messages-header text-center px-0">
            <b-col>
              <chat-header v-model="value" @on-user-enter="enterChat" @on-user-leave="leaveChat({leaveUser: $event})"/>
            </b-col>
            <b-col v-if="writeUsers.length" ref="col-typing" class="messages-typing pb-1">
              <chat-typing :users="writeUsers" :group="isChatGroup"/>
            </b-col>
          </b-col>

          <b-col class="messages-container" >
            <b-container id="messages" ref="messages"  @scroll="_scrollListener" :fluid="!fromLink">
              <b-row v-for="mex in messages" :key="mex._id" :class="_classSingleMessage(mex)" cols="1">
                <b-col cols="12" sm="9" md="8">
                  <chat-message :value="mex" :group="isChatGroup" @resend="resendMessage" :attachment-api="getAttachmentsInfo" />
                </b-col>
              </b-row>
              <b-row v-if="!messages" class="h-100" align-v="center" align-h="center">
                <b-col class="text-center">
                  <b-spinner variant="primary" type="grow" />
                </b-col>
              </b-row>
            </b-container>

            <div class="read-new-messages" v-if="!amInReading && newMessages.length">
              <b-badge variant="light">
                {{ newMessages.length }} <span class="sr-only"> nuovi messagi </span>
              </b-badge>
              <b-button @click="_clickToBottom" pill variant="secondary" :title="`${newMessages.length} nuovi messaggi`">
                <b-icon-chevron-down aria-hidden="true"/>
              </b-button>
            </div>

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
                          <b-col class="pl-1"> <span>{{ _recipeCategoryName(item.category) }}</span> </b-col>
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
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import {mapGetters, mapMutations} from "vuex";

import {ChatMixin, RecipeMixin, PendingRequestMixin} from "@mixins"

export default {
  name: "chat",
  mixins: [ChatMixin, RecipeMixin, PendingRequestMixin],
  props: {
    value: Object | Boolean,
    fromLink: Boolean
  },
  data(){
    return {
      messages: null,

      writeUsers: [],
      amInReading: false,

      recipes: [],
      attachment: { id: '', link:'' , preview: {} },
    }
  },
  filters: {
    dateFormat: function (text){
      return dateFormat(text)
    }
  },
  watch: {
    messages: {
      deep: true,
      handler(val, old){
        if(!old) this.$nextTick(() => this._goToTheBottom())

        if(val?.length === 1){
          console.debug('CHAT IS STARTED')
          this.value.started = true
          this.$emit('start')
        }

        if(old && this.amInReading) this._goToTheBottom('smooth')
      }
    },

    amInReading(val){
      if(val) this.readMessages(this.newMessages)
    },
    value(val, old) {
      if(old && (val._id !== old._id)) {
        this.messages = null
        this.pendingRequests.cancelAll('all retrieve chat request cancel')
        this.$socket.emit('chat:leave', this._chatInfo(old))
      }
      this._initialization(val)
    },
    'attachment.link'(val){
      if(val) {
        let recipe = this.recipes.find(r => r._id === this.attachment.id)
        if(recipe) this.attachment.preview = this.createObjectPreview(recipe, val)
      }
      else {
        this.attachment.preview = {}
      }
    }
  },
  computed: {

    classContainer(){
      return {
        'h-100': true,
        'align-items-center vh-100': this.fromLink,
      }
    },

    classMessagesContainer(){
      return {
        'messages-container': true,
      }
    },

    newMessages(){
      return this.messages?.filter(m => m.sender._id !== this.userIdentifier && !m.read.find(r => r.user._id === this.userIdentifier)) || []
    },

    _linkAttachmentInfo(){
      return {
        origin: window.origin,
        pattern: `${this.$route.path}/recipes/*`
      }
    },

    ...mapGetters({
      isLoggedIn: 'session/isLoggedIn',
      username: 'session/username',
      userIdentifier: 'session/userIdentifier'
    }),
    ...mapGetters(['getRecipeCategoryByValue']),

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
    isChatOne(){
      return this.value && this._isChatOne(this.value.info)
    },

    amINotReaderUser(){
      return this.value && this.value.users.find(u => u.user?._id === this.userIdentifier && u.role !== 'reader')
    },

    infoChat(){
      return this.value.info
    },
    usersChat(){
      return this.value.users
    },

    _actualInfoChat(){
      return this._chatInfo(this.value)
    }
  },

  methods: {
    _chatInfo(val){
      if(val) {
        return {
          _id: val._id,
          info: {
            type: val.info.type,
            name: val.info.name,
            usersRole: ( !this.withAdmin && this._isChatGroup(val.info)  ? val.users.filter(r => r.role !== 'reader') : val.users)
                        .map(u => ({user: u.user._id, role: u.role}))
          },
          users: val.users.map(u => u.user)
        }
      }
      return { _id: null, info: {}, users: [] }
    },

    _classSingleMessage(message){
      return ['px-3',  message.sender._id === this.userIdentifier ? 'justify-content-end' : 'justify-content-start']
    },
    _recipeCategoryName(val){
      return this.getRecipeCategoryByValue(val)?.text || '';
    },

    _goToTheBottom(behavior = 'auto'){
      console.debug('Go To The Bottom of the messages : behavior = ', behavior)
      const messagesContainer = document.getElementById('messages')//this.$el.querySelector('#messages')
      if(messagesContainer) {
        this.amInReading = messagesContainer.clientHeight >= messagesContainer.scrollHeight //no scrollbar on div messages
        messagesContainer.scrollTo({ top: messagesContainer.scrollHeight, behavior: behavior});
      }
    },

    _clickToBottom(){
      console.debug('Click Go to the bottom for read new messages...')
      this._goToTheBottom('smooth')
    },

    _scrollListener(event){
      const { scrollTop , scrollHeight, offsetHeight } = event.target
      this.amInReading = (scrollTop + offsetHeight >= scrollHeight)
      console.debug('Scrolling: In Reading ',this.amInReading,', # new messages = ', this.newMessages.length)
    },


    _changeStateMyMessage(newStateMessage){
      const lastMessage = lastOf(this.messages, m => m.sender._id === this.userIdentifier)
      Object.assign(lastMessage, newStateMessage)
      console.debug('new lastMessage = ', lastMessage)
      console.debug('all messages = ', this.messages)
    },

    sendTyping(typing = false){
      this.$socket.emit('chat:typing', this.temporaryNameChat, { _id: this.userIdentifier, userID: this.username, typing: typing } )
    },
    receiveTyping(data){
      if (data.typing) pushIfAbsent(this.writeUsers, data)
      else removeIfPresent(this.writeUsers, w => w._id === data._id)
      console.debug('TYPING = ',  data)
    },
    ...mapMutations({
      removeUnReadMessage: 'chats/remove-unread'
    }),
    readMessages(messages){
      if(messages.length) {
        let messagesIds = messages.map(m => m._id)
        console.debug('Read messages = ', messagesIds)
        this.$store.dispatch('chats/messages/read', {chatID: this.value._id, messagesIds})
            .then((response) => {
              console.debug(response)
              let _dataEvent = {chatID: this.value._id, readMessages: messages.length}
              if(!response) {
                this.$emit('onMessagesJustRead', _dataEvent)
                return console.debug('Message ('+messagesIds+') has already read.');
              }
              const {description, readers} = response.data
              const reader = Object.values(readers)[0].user
              messages.forEach(message => message.read.push(readers[message._id]) )
              this.$emit('onReadMessages', _dataEvent)
              console.debug(description, ' from ', reader.userID)
              this.$socket.emit('chat:read', this.temporaryNameChat, messages)
            })
            .catch(this.$store.$api.errorsHandler.messages.readMessages)
      }
    },
    receiveConfirmReadMessages(messages){
      console.debug('Conferm read: ', messages)
      for (const message of messages){
        replaceIfPresent(this.messages, m => m._id === message._id, message)
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
        this.$nextTick(() => this._goToTheBottom('smooth'))
        this.sendTyping()
      }
      console.debug('Message to delivered = ', JSON.stringify(_message))

      this.whenAttachmentPresetUpdatePermission()
          .then(() => {
            const data = {
              content: _message.content,
              attachment: _message.attachment ? _message.attachment.replace(this._linkAttachmentInfo.origin, '') : undefined,
              timestamp: _message.timestamp
            }
            this.$store.dispatch('chats/messages/create', {chatID: this.value._id, data })
                .then(({data}) => {
                  console.debug('Message has been delivered => ', JSON.stringify(data))
                  Object.assign(_message, data)
                  this.$socket.emit('chat:messages', this.temporaryNameChat, data)
                  this.resetAttachment()
                  return true
                })
                .catch(this.$store.$api.errorsHandler.messages.createMessage)
                .then(delivered => this._changeStateMyMessage({ delivered }))
          })
          .catch((e) => { console.error('NO UPDATE PERMISSION ', e); this._changeStateMyMessage({ delivered: false }); })
    },
    resendMessage(message){ // with message as object
      message.delivered = null
      this.sendMessage(message)
    },
    receiveMessages(messages){
      console.debug('Receive messages = ', messages)
      messages.filter(message => message.attachment).forEach(message =>message.attachment = `${window.origin}${message.attachment}`)
      this.messages.push(...messages)
      if(this.amInReading) this.readMessages(messages)
    },

    enterChat({chatName, enteredUser}){
      if(chatName && enteredUser){
        this.temporaryNameChat = chatName
        console.debug('User ', enteredUser, ' enter in chat : ', this.temporaryNameChat)
      }
    },
    leaveChat({chatName, leaveUser}){
      if(chatName) console.debug('User ', leaveUser, ' leave chat : ', chatName)
      removeIfPresent(this.writeUsers, w => w._id === leaveUser)
    },

    reEnterInChat(){
      this.$socket.emit("chat:enter", this._actualInfoChat)
    },

    _initMessages(chatMessages){
      this.messages = chatMessages.map(message => Object.assign(message, {delivered: true}))
      this.readMessages(this.newMessages.reverse())
    },
    _initialization(chat){
      if(chat) {
        console.debug('Chat ', chat)
        this.$socket.emit('chat:enter', this._actualInfoChat)

        if((this.isChatOne || this.withAdmin) && chat.users.find(u => u.user._id === this.userIdentifier && u.role === 'reader')) {
          let role = this.withAdmin ? 'admin' : 'writer'
          this.$store.dispatch('chats/update-role', {chatID: chat._id, role })
                    .then(({data}) => {
                      console.debug(data.description)
                      this.$socket.emit('chat:change:role', chat._id, { user: this.userIdentifier, role })
                    })
                    .catch(this.$store.$api.errorsHandler.chats.updateUserRoleInChat)
        }

        if(chat.messages) this._initMessages(chat.messages)
        else {
          let idRequest = 'chat-messages'
          console.debug('GET MESSAGES ....')
          let options = this.makeRequestOptions(idRequest, {message: 'Chat messages abort.'})
          this.$store.dispatch('chats/messages/all', {chatID: chat._id, options})
              .then(({data}) => this._initMessages(data))
              .catch(this.$store.$api.errorsHandler.messages.listMessages)
              .finally(() => this.pendingRequests.remove(idRequest))
        }

        console.debug('Initialization chat info = ', JSON.stringify(chat.info, null,1))
        console.debug('Initialization chat users = ', JSON.stringify(chat.users, null,1))

        if(!this.isAdmin && !this.withAdmin) this.getAttachmentsRecipes()
        else this.recipes = []
      }
    },

    /*ATTACHMENTS*/

    _linkAttachment(id){
      return `${window.origin}/chats/${this.value._id}/recipes/${id}`
    },

    getAttachmentsRecipes(){
      let idRequest = 'attachments'
      let options = this.makeRequestOptions(idRequest, {message: 'Attachments abort.'})
      this.$store.dispatch('recipes/saved', {options})
          .then(({data}) =>{
            this.recipes = data.items;
            console.debug('Attachments = > ', data.items)
          })
          .catch(this.$store.$api.errorsHandler.messages.getAttachments)
          .finally(() => this.pendingRequests.remove(idRequest))
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

        executor = (resolve, reject) => this.$store.dispatch('recipes/update-permission', {recipeID: this.attachment.id, permission})
                                           .then(({data}) => {
                                              this.setDefaultValueOn(data.updatedRecipe)
                                              console.debug('Update permission: ', data)
                                              this.$socket.emit("recipe:add:permission", data.updatedRecipe)
                                              resolve()
                                           })
                                           .catch(err =>{
                                              this.$store.$api.errorsHandler.messages.updatePermissionAttachment(err)
                                              reject(err)
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
        return this.$store.dispatch('recipes/one', {recipeID: id})
                  .then(({data}) =>{
                    console.debug('Attachments = > ', data)
                    return this.createObjectPreview(data, link)
                  })
                  .catch(err => {
                    this.$store.$api.errorsHandler.messages.getAttachment(err)
                    return {link}
                  })
      }
    },

    /*LISTENER UPDATE*/
    onUpdateUserInfo(userInfo){
      if(this.value && userInfo) {
        this._onUpdateUserInOneChat(this.value, userInfo)
        if(!this.value.messages) this._onUpdateUserInfosInMessages(this.messages, userInfo)
      }
    }
  },
  created() {
    this.$socket.on('enter', this.enterChat.bind(this))
    this.$socket.on('leave', this.leaveChat.bind(this))
    this.$socket.on('read-messages', this.receiveConfirmReadMessages.bind(this))
    this.$socket.on('typing', this.receiveTyping.bind(this))
    this.$socket.on('messages', this.receiveMessages.bind(this))

    this.$bus.$on('user:update:info', this.onUpdateUserInfo.bind(this))

    this.$bus.$on('chat:re-enter', this.reEnterInChat.bind(this))

    console.debug('Created: chat is  ', this.value, ', from link ', this.fromLink)
    this._initialization(this.value)
  },

  beforeDestroy() {

    this.$socket.off('enter', this.enterChat.bind(this))
    this.$socket.off('leave', this.leaveChat.bind(this))
    this.$socket.off('read-messages', this.receiveConfirmReadMessages.bind(this))
    this.$socket.off('typing', this.receiveTyping.bind(this))
    this.$socket.off('messages', this.receiveMessages.bind(this))

    this.$bus.$off('user:update:info', this.onUpdateUserInfo.bind(this))
    this.$bus.$off('chat:re-enter', this.reEnterInChat.bind(this))

    if(this.value) this.$socket.emit('chat:leave', this._actualInfoChat)
  }
}
</script>

<style lang="scss" scoped>

.chat {

  & .messages-header{
    border-radius: 1.25rem 1.25rem 0 0;
    box-shadow: 0 3px 12px 0 #0000006e;
    background-color: $background-color-chat-header;
    color: white;
  }


  & .messages-container {
    background-color: $background-color-chat;
    box-sizing: border-box;
    & > div#messages {
      overflow: auto;
      height: 500px;
    }
    & .read-new-messages{
      position: absolute;
      bottom: 20px;
      right: 40px;

      & button{
        box-shadow: 0 0 20px 5px black;
      }
      & span.badge {
        position: absolute;
        top: -5px;
        right: 0;
      }
    }
  }

  .messages-container.top-rounded {
    border-radius: 1.25rem 1.25rem 0 0;
  }

  & .messages-footer {
    background-color: lightgrey;
    //box-shadow: 0px -3px 12px 0px #0000006e;
    border-radius: 0 0 1.25rem 1.25rem ;
  }
}
</style>