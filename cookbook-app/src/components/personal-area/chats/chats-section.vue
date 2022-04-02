<template>
  <b-container fluid class="my-4 px-4">
    <b-row class="mb-5" align-h="center" v-if="!isAdmin">
      <b-col class="text-left px-0">
        <b-button id="chat-with-admins" variant="primary" @click="chatWithAdmin"> <b-icon-chat-fill class="mr-1"/> Chatta con amministartori</b-button>
      </b-col>
    </b-row>
    <b-row align-h="center">
      <b-col class="px-0" :cols="friends.length ? 10: 12">
        <b-form-group label-for="search-chat" label="Ricerca chats" label-sr-only>
          <b-input-group>
            <b-input-group-prepend>
              <b-input-group-text>
                <b-icon-search />
              </b-input-group-text>
            </b-input-group-prepend>
            <b-form-input id="search-chat" v-model="searchChat" type="search" placeholder="Ricerca tra le chat avviate" />
          </b-input-group>
        </b-form-group>
      </b-col>
      <b-col cols="2" class="text-right pl-0 pr-1" v-if="friends.length">
       <b-button title="Nuova chat" @click="newChat=true"> <b-icon-pencil-square /> </b-button>
      </b-col>
    </b-row>
    <b-row cols="1" cols-sm="1" cols-md="2">

      <b-col v-if="!processing && started.length===0" cols="12" class="pl-0">
        <p v-if="isSearchModeChat">
          <span>
            <strong>Risulati: </strong>
            Nessuna chat trova.
          </span>
        </p>
        <p v-else>Nessuna chat aperta.</p>
      </b-col>

      <b-col cols="12" sm="12" md="12" lg="4" class="pl-0 pr-2">
        <b-navbar toggleable="lg" class="w-100 px-0" >
          <b-navbar-toggle ref="btn-chats-navigator" target="chat-items-navigator" v-if="started.length">
            <template #default="{ expanded }">
              <b-icon v-if="expanded" icon="chevron-bar-up" variant="danger" title="Nascondi chat avviate"></b-icon>
              <b-icon v-else icon="chevron-bar-down" variant="primary" title="Mostra chat avviate"></b-icon>
            </template>
          </b-navbar-toggle>

          <b-collapse id="chat-items-navigator" is-nav>
            <b-navbar-nav class="ml-auto">
              <b-list-group class="chat-list">
                <div v-if="processing">
                  <b-list-group-item v-for="i in skeletons" :key="i">
                    <chat-item skeleton/>
                  </b-list-group-item>
                </div>
                <b-list-group-item  button v-for="chat in started" :key="chat._id" :active="_iSelectedChat(chat)" @click="_clickItem(chat)">
                  <chat-item :ref="chatItemRef(chat._id)" class="nav-item" :value="chat" @remove-chat="openDeleteModal" @redirectOtherTab="redirectOtherTab" />
                </b-list-group-item>
              </b-list-group>
            </b-navbar-nav>
          </b-collapse>
        </b-navbar>
      </b-col>

      <b-col v-show="showChatContainer" class="chat-container px-0 py-0" cols="12" sm="12" md="12" lg="8">
        <chat v-if="selectedChat" v-model="selectedChat" class="w-100 h-100" @onReadMessages="onReadMessages" @start="onStartChat"/>
      </b-col>
    </b-row>

    <!-- NEW CHAT MODEL -->
    <b-modal v-model="newChat" title="Nuova chat" hide-footer centered>
      <b-container>
        <b-row >
          <b-col class="px-0">
            <b-form-group label-for="search-friend" label="Ricerca amici" label-sr-only>
              <b-input-group>
                <b-input-group-prepend>
                  <b-input-group-text>
                    <b-icon-search aria-hidden="true"/>
                  </b-input-group-text>
                </b-input-group-prepend>
                <b-form-input id="search-friend" v-model="searchFriend" type="search" :placeholder="'Ricerca ' + (isAdmin ? 'utente': 'amico')"/>
              </b-input-group>
            </b-form-group>
          </b-col>
        </b-row>
        <b-row cols="1" class="friends-list">
          <b-col v-for="friend in _friends" :key="friend._id" class="friend-item px-0">
            <chat-friend-item :value="friend" @clickUser="onAddNewChat"/>
          </b-col>
          <b-col v-if="_friends.length === 0">
            <span>
              <strong>Risulato: </strong> Nessun {{isAdmin? 'utente': 'amico'}} trovato.
            </span>
        </b-col>
        </b-row>
      </b-container>
    </b-modal>
    <!-- DELETE CHAT MODEL -->
    <b-modal centered v-model="deleteChat.show" title="Cancellazione chat" @ok="onRemoveChat">
      <p> Sei sicura/o di voler cancellare la chat <strong>{{ deleteChat.chat.name }}</strong> ? </p>
    </b-modal>
  </b-container>
</template>

<script>
import {mapGetters} from "vuex";
import {ChatMixin, PendingRequestMixin} from '@mixins'

export default {
  name: "chats-section",
  mixins: [ChatMixin, PendingRequestMixin],
  data(){
    return {
      skeletons: 3,
      processing: true,

      selectedChat: null,

      searchChat: '',
      chats: [],
      newChat: false,
      deleteChat: {
        show: false,
        chat: {}
      },
      chat: { show: false, receiver: {} },

      searchFriend: '',
      friends: [],
      justRequestFriend: false
    }
  },
  computed: {
    showChatContainer(){
      if(this.isSearchModeChat) return this.started.find(chat => this._iSelectedChat(chat))
      return (!this.processing && this.started.length > 0) || this.processing
    },
    ...mapGetters({
      userIdentifier: 'session/userIdentifier',
      isAdmin: 'session/isAdmin',

      acceptedFriends: 'friendships/acceptedFriends'
    }),

    _friends(){
      return this.isSearchModeFriend ? this.friends.filter(f => f.user.userID.toLowerCase().startsWith(this.searchFriend.toLowerCase()))
                                             : this.friends
    },
    isSearchModeFriend(){
      return this.searchFriend.trim().length > 0
    },

    isSearchModeChat(){
      let searching = this.searchChat.trim().length > 0
      if(searching) this._clickShowNavChat()
      else this._clickHideNavChat()
      return searching
    },

    writeableChats(){
      const _writeableChats = this.chats
                                  .filter(chat => (this._isChatOne(chat.info) && this._amIReader(chat.users) && chat.unreadMessages > 0) || this._amINotReader(chat.users))
                                  .filter(chat => this._baseInfoUser(chat.info, chat.users))

      console.debug('writeableChats ', _writeableChats)
      return this.isSearchModeChat ?
          _writeableChats.filter(chat => chat.started).map(chat => ({name: this._baseInfoUser(chat.info, chat.users).name, chat}))
                         .filter(o => o.name && o.name.toLowerCase().startsWith(this.searchChat.toLowerCase()))
                         .map(o => o.chat)
          : _writeableChats
    },
    started(){
      return this.writeableChats.filter(chat => chat.started)
    }
  },
  watch:{
    acceptedFriends: {
      deep: true,
      handler(val){
        this.friends = val
        console.debug('acceptedFriends update watch ..... ', val)
        if(!this.isSearchModeFriend && !this.isAdmin && this.friends.length === 0 && !this.justRequestFriend){
          console.debug('request get all accepted friend ..... ')
          this.justRequestFriend = true
          let idRequest = 'friend-signed-user'
          let options = this.makeRequestOptions(idRequest)
          this.$store.dispatch('friendships/own', { state: 'accepted', options })
              .then(({data}) => console.debug('retrieve own accepted friends.'))
              .catch(this.$store.$api.errorsHandler.chats.getFriendOnChat)
              .then(() => this.pendingRequests.remove(idRequest))
        }
      }
    }
  },
  methods: {
    chatItemRef(chatID){
      return 'chat-' + chatID
    },
    _clickItem(item){
      this.selectedChat = item
      if(this.isSearchModeChat) this.searchChat = ''
      else this._clickHideNavChat()
    },
    _clickShowNavChat(){
      let element = this.$refs['btn-chats-navigator']?.$el
      if(element && element.classList.contains('collapsed')) element.click()
    },
    _clickHideNavChat(){
      let element = this.$refs['btn-chats-navigator']?.$el
      if(element && !element.classList.contains('collapsed')) element.click()
    },

    _iSelectedChat(chat){
      return this.selectedChat?._id === chat?._id
    },

    getFriends(){
      if(this.isAdmin){
        let idRequest = 'all-users'
        let options = this.makeRequestOptions(idRequest)
        this.$store.dispatch('users/all', {options})
            .then(({data}) => {
              this.friends = data.items.filter(u => u.signup === 'checked')
                  .map(user => ({user: {_id: user._id, userID: user.userID, img: user.information.img, country: user.information.country} }))
              console.debug('users => ', this.friends)
            })
            .catch(this.$store.$api.errorsHandler.chats.getFriendOnChat)
            .then(() =>  this.pendingRequests.remove(idRequest))
      } else {
        this.friends = this.acceptedFriends
      }
    },

    getChats(){
      let idRequest = 'chats-own'
      let options = this.makeRequestOptions(idRequest)
      this.$store.dispatch('chats/own-without-message', {options})
          .then(({data}) => {
            this.chats = data.items
            console.log('Chats = ', this.chats)
            this.chats.forEach(chat => console.debug(chat.users.map(r => r.user?.role)))
            return true
          })
          .catch(this.$store.$api.errorsHandler.chats.getChats)
          .then(processEnd => {
            this.processing = !processEnd
            this.pendingRequests.remove(idRequest)
          })
    },

    onStartChat(){
      prependIfPresent(this.chats, this.selectedChat)
    },
    onReadMessages({chatID, readMessages}){
      let chat = this.chats.find(c => c._id === chatID)
      if(chat && chat.unreadMessages) {
        chat.unreadMessages-=readMessages
      }
    },
    redirectOtherTab(chat){
      console.debug('Redirect in other TAB')
    },
    /* ADD CHAT */
    addChat(chat){
      console.debug('Add New Chat = ', chat)
      let _chat
      if(isString(chat)) _chat = this.chats.find(c => c._id === chat)
      else{
        _chat = {...chat,  unreadMessage: 0, started: false }
        delete _chat.messages
        console.debug('Remapped chat = ', _chat)
        this.chats.push(_chat)
      }
      if(_chat) this.selectedChat = _chat
    },
    chatWithAdmin(){
      console.debug('GO TO CHAT with ADMIN ')
      this._goToChat('admin', this.addChat.bind(this))
    },
    onAddNewChat(userFriend){
      this.newChat = false
      console.debug('GO TO CHAT with = ', userFriend.userID)
      this._goToChat(userFriend._id, this.addChat.bind(this))
    },
    /* REMOVE CHAT */
    openDeleteModal(chatID){
      const index = this.chats.findIndex(c => c._id === chatID)
      const chatItem = this.$refs[this.chatItemRef(chatID)][0]
      if(index !== -1 && chatItem) {
        console.debug('Chat item  => ',chatItem)
        this.deleteChat = {
          show: true,
          chat: {index: index, _id: chatID, name: chatItem.name}
        }
      }
    },
    onRemoveChat(){
      this.$store.dispatch('chats/remove', this.deleteChat.chat._id)
          .then(({data}) => {
            console.log(data.description)
            let userRole = { user: this.userIdentifier, role: 'reader' }
            this.onListenerChangeRole(this.deleteChat.chat._id, userRole)
            this.$socket.emit('chat:change:role',this.deleteChat.chat._id, userRole)
            console.debug(this.chats)
            if(this._iSelectedChat(this.deleteChat.chat)) this.selectedChat = null
          })
          .catch(this.$store.$api.errorsHandler.chats.deleteChat)
    },

    /*LISTENERS PUSH MESSAGE */
    onListenersPushMessage(chatInfo, message){
      const index = this.chats.findIndex(chat => chat._id === chatInfo._id)
      if(index !== -1){
        const chat = this.chats[index]
        if(this._iSelectedChat(chat)){
          this.$store.commit('chats/remove-unread')
        } else {
          prependIfPresent(this.chats, chat)
          chat.unreadMessages += 1
          chat.started = true
        }
      } else {
        console.debug('Chat ', chatInfo)
        this.$store.dispatch('chats/one-without-messages', {chatID: chatInfo._id})
            .then(({data}) => {
              this.chats.unshift(data)
              console.debug(data.users.map(r => r.user.role))
           })
           .catch(this.$store.$api.errorsHandler.chats.getNewChat)
      }
    },
    onListenersReadMessages({messages, info}){
      console.log('Read messages ', messages ,' of chat ', info)
      if(!this._iSelectedChat(info)) {
        const chat = this.chats.find(chat => chat._id === info._id)
        if(chat){
          messages.forEach(() => {
            this.$store.commit('chats/remove-unread')
            chat.unreadMessages -= 1
            console.log('chat.unreadMessages ', chat.unreadMessages )
          })
        }
      }
    },
    onListenerChangeRole(chatID, userRole){
      const chat = this.chats.find(chat => chat._id === chatID)
      if(chat){
        const user = chat.users.find(r => r.user._id === userRole.user)
        if(user) {
          Object.assign(user, {role: userRole.role})
          console.debug('chat ', chat,', change role of user ', user)
        }
      }
    },

    /* LISTENERS UPDATES */
    onUpdateUserInfo(userInfo){
      if(userInfo) this.chats.forEach(chat => this._onUpdateUserInOneChat(chat, userInfo))
    },
    onRemoveFriendShip(friendship){
      let friendId = friendship.from?._id === this.userIdentifier ? friendship.to?._id :
                     friendship.to?._id === this.userIdentifier ? friendship.from?._id : undefined
      console.debug('onRemoveFriendShip: friend id = ', friendId)
      if(friendId){
        this.chats.filter(chat => this._isChatOne(chat.info))
                  .filter(chat => chat.users.find(r => r.user._id  === friendId))
                  .forEach(chat => chat.users.forEach(r => {
                    r.role = 'reader';
                    r.exitedAt = Date.now()
                  }))
      }
    },

    onDeleteUser(id){
      console.debug('onDeleteUser ', id)

      let removedChat = removeIfPresent(this.chats, chat => {
        let users = chat.users.map(u => u.user._id);
        return this._isChatOne(chat.info) && users.length === 2 && users.includes(id) && users.includes(this.userIdentifier)
      })
      if(this._iSelectedChat(removedChat)) this.selectedChat = null

      for (let ind = 0; ind < this.chats.length; ind++) {
        const chat = this.chats[ind]
        if(this._isChatGroup(chat.info) && chat.users.map(u => u.user._id).includes(id)){
          console.debug('index ', ind, ' chat ', chat)
          let chatWithAdmin = chat.users.filter(u => 'admin' === u.user.role)
          if(chatWithAdmin.length === chat.users.length - 1) {
            this.chats.splice(ind, 1)
            removeIfPresent(this.friends, f => f.user._id === id)
            if(this._iSelectedChat(chat)) this.selectedChat = null
          }
          else removeIfPresent(chat.users, r => r.user._id === id)
        }
      }

    }
  },
  created() {
    this.getFriends()
    this.getChats()

    this.$bus.$on('push-message', this.onListenersPushMessage.bind(this))
    this.$bus.$on('read-message', this.onListenersReadMessages.bind(this))
    this.$bus.$on('chat:change:role', this.onListenerChangeRole.bind(this))

    this.$bus.$on('user:update:info', this.onUpdateUserInfo.bind(this))
    this.$bus.$on('friend:remove', this.onRemoveFriendShip.bind(this))
    this.$bus.$on('user:delete', this.onDeleteUser.bind(this))
  },
  beforeDestroy() {
    this.$bus.$off('push-message', this.onListenersPushMessage.bind(this))
    this.$bus.$off('read-message', this.onListenersReadMessages.bind(this))
    this.$bus.$off('chat:change:role', this.onListenerChangeRole.bind(this))

    this.$bus.$off('user:update:info', this.onUpdateUserInfo.bind(this))
    this.$bus.$off('friend:remove', this.onRemoveFriendShip.bind(this))
    this.$bus.$off('user:delete', this.onDeleteUser.bind(this))
  }
}
</script>

<style  lang="scss" scoped>

$height_items_chat: 700px;

.chat-container {
  background-color: $background-color-chat;
  border-radius: 1.25rem;
  min-height: $height_items_chat;
  box-sizing: border-box;
}

#chat-items-navigator {
  & .chat-list {
    max-height: $height_items_chat;
    overflow-y: auto;

    & .chat-item.selected {
      background-color: #b8c6ff;
    }
  }
  & > ul {
    margin: 0!important;
    flex-direction: column!important;
    height: 100%;
    width: 100%;
  }
}

.friends-list{
  overflow-y: auto;
  max-height: 400px;
}

</style>
