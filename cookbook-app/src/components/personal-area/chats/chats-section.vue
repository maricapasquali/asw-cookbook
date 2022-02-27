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
       <b-button id="new-chat-btn" @click="newChat=true"> <b-icon-pencil-square /> </b-button>
        <b-tooltip target="new-chat-btn"> Nuova chat </b-tooltip>
      </b-col>
    </b-row>
    <b-row cols="1" cols-sm="1" cols-md="2">
      <b-col v-if="!processing && writeableChats.length===0" cols="12">
        <p v-if="isSearchModeChat">Nessuna chat trova.</p>
        <p v-else>Nessuna chat aperta.</p>
      </b-col>

      <b-col cols="12" sm="12" md="12" lg="4" class="px-0">
        <b-navbar toggleable="lg" class="w-100 px-0">
          <b-navbar-toggle ref="btn-chats-navigator" target="chat-items-navigator">
            <template #default="{ expanded }">
              <b-icon v-if="expanded" icon="chevron-bar-up"></b-icon>
              <b-icon v-else icon="chevron-bar-down"></b-icon>
            </template>
          </b-navbar-toggle>
          <b-collapse id="chat-items-navigator" class="chat-items-container" is-nav>
            <b-navbar-nav class="ml-auto">
              <b-list-group>
                <b-list-group-item  v-if="processing" v-for="i in skeletons" :key="i">
                  <chat-item skeleton/>
                </b-list-group-item>
                <b-list-group-item  button v-for="chat in started" :key="chat._id" :active="_iSelectedChat(chat)" @click="_clickItem(chat)">
                  <chat-item :ref="chatItemRef(chat._id)" class="nav-item" :value="chat" @remove-chat="openDeleteModal" @redirectOtherTab="redirectOtherTab" />
                </b-list-group-item>
              </b-list-group>
            </b-navbar-nav>
          </b-collapse>
        </b-navbar>
      </b-col>

      <b-col v-if="showChatContainer && selectedChat" class="px-0" cols="12" sm="12" md="12" lg="8">
        <chat v-model="selectedChat" @onReadMessages="onReadMessages" />
      </b-col>
      <b-col v-else-if="showChatContainer" class="chat-container"  cols="12" sm="12" md="12" lg="8"/>

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
                    <b-icon-search />
                  </b-input-group-text>
                </b-input-group-prepend>
                <b-form-input id="search-friend" v-model="searchFriend" type="search" :placeholder="'Ricerca ' + (isAdmin ? 'utente': 'amico')"/>
              </b-input-group>
            </b-form-group>
          </b-col>
        </b-row>
        <b-row cols="1" class="friends-list">
          <b-col v-for="friend in _friends" :key="friend._id" class="friend-item px-0">
            <b-container fluid class="px-0">
              <b-row align-v="center" class="m-2 p-2" @click="onAddNewChat(friend.user)" cols="2" cols-sm="2" cols-md="3">
                <b-col cols="3" sm="3" md="3" > <avatar v-model="friend.user.img" :user="friend.user._id" :size="40"/></b-col>
                <b-col cols="9" sm="9" md="7" >{{friend.user.userID}} </b-col>
                <b-col cols="12" sm="12" md="2" class="text-right">
                  <country-image v-model="friend.user.country"/>
                </b-col>
              </b-row>
            </b-container>
          </b-col>
          <b-col v-if="_friends.length === 0"> Nessun {{isAdmin? 'utente': 'amico'}} trovato. </b-col>
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
import {mapping} from "@api/users/friends/utils";
import {mapGetters} from "vuex";
import {_goToChat, _baseInfoUser, _isChatOne, _isChatGroup} from '@components/chats/utils'

import { onUpdateUserInChatSection,  _onUpdateUserInOneChat, _onUpdateUserInfos } from '@components/chats/utils'
import {QueuePendingRequests} from "@api/request";

export default {
  name: "chats-section",
  data(){
    return {
      skeletons: 3,
      pendingRequests: null,
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
      friends: []
    }
  },
  computed: {
    showChatContainer(){
      return !this.isSearchModeChat || (this.isSearchModeChat && this.writeableChats.length)
    },
    ...mapGetters({
      userIdentifier: 'session/userIdentifier',
      isAdmin: 'session/isAdmin'
    }),
    _friends(){
      return this.searchFriend.trim().length ? this.friends.filter(f => f.user.userID.toLowerCase().startsWith(this.searchFriend.toLowerCase()))
                                             : this.friends
    },
    isSearchModeChat(){
      return this.searchChat.trim().length > 0
    },
    writeableChats(){
      const _writeableChats = this.chats.filter(chat => chat.users.find(r => r.user?._id === this.userIdentifier && r.role !== 'reader'))
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
  methods: {
    chatItemRef(chatID){
      return 'chat-' + chatID
    },
    _clickItem(item){
      this.selectedChat = item
      let element = this.$refs['btn-chats-navigator']?.$el
      if(element && !element.classList.contains('collapsed')) element.click()
    },
    _iSelectedChat(chat){
      return this.selectedChat?._id === chat._id
    },
    _isChatOne,
    _isChatGroup,
    _baseInfoUser,

    getFriends(){
      let idRequest = 'friend-user'
      let options = QueuePendingRequests.makeOptions(this.pendingRequests, idRequest)
      if(this.isAdmin){
        this.$store.dispatch('users/all', {options})
            .then(({data}) => {
              this.friends = data.items.filter(u => u.signup === 'checked')
                  .map(user => ({user: {_id: user._id, userID: user.userID, img: user.information.img, country: user.information.country} }))
              console.debug('users => ', this.friends)
            })
            //TODO: HANDLER ERROR GET FRIEND IN CHATS SECTION
            .catch(err => console.error(err))
            .then(() =>  this.pendingRequests.remove(idRequest))
      }else {
        this.$store.dispatch('friendships/own', { state: 'accepted', options })
            .then(({data}) => {
              this.friends = data.items
              console.debug('friendships => ', this.friends)
            })
            //TODO: HANDLER ERROR GET FRIEND IN CHATS SECTION
            .catch(err => console.error(err))
            .then(() =>  this.pendingRequests.remove(idRequest))
      }
    },

    getChats(){
      let idRequest = 'chats-own'
      let options = QueuePendingRequests.makeOptions(this.pendingRequests, idRequest)
      this.$store.dispatch('chats/own-without-message', {options})
          .then(({data}) => {
            this.chats = data.items
            console.log('Chats = ', this.chats)
            this.chats.forEach(chat => console.debug(chat.users.map(r => r.user?.role)))
          })
          //TODO: HANDLER ERROR GET CHATS
          .catch(err => console.error(err))
          .finally(() => {
            this.processing = false
            this.pendingRequests.remove(idRequest)
          })
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
    _goToChat,
    _remapNewChat(chat){
        let _chat = {...chat,  unreadMessage: 0, started: false }
        delete _chat.messages
        console.debug('Remapped chat = ', _chat)
        return _chat
    },
    addChat(chat){
      console.debug('Add New Chat = ', chat)
      this.chats.push(this._remapNewChat(chat))
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
      let index = this.chats.findIndex(c => c._id === chatID)
      if(index !== -1) {
        const chat = this.chats[index]
        const chatItem = this.$refs[this.chatItemRef(chatID)][0]
        console.debug(chatItem)
        this.deleteChat = {
          show: true,
          chat: {index: index, _id: chat._id, name: chatItem.name}
        }
        if(chat._id === this.selectedChat) this.selectedChat = false
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
          })
          //TODO: HANDLER ERROR DELETE CHAT
          .catch(err => console.error(err))
    },

    /*LISTENERS PUSH MESSAGE */
    onListenersPushMessage(chatInfo, message){
      const index = this.chats.findIndex(chat => chat._id === chatInfo._id)
      if(index !== -1){
        const chat = this.chats[index]
        if(this.selectedChat._id === chat._id){
          this.$store.commit('chats/remove-unread')
        } else {
          chat.unreadMessages += 1
          this.chats.unshift(this.chats.splice(index, 1)[0])
        }
      } else {
        this.$store.dispatch('chats/one-without-messages', {chatID: chatInfo._id})
            .then(({data}) => {
              this.chats.unshift(data)
              console.debug(data.users.map(r => r.user.role))
           })
           //TODO: HANDLER ERROR GET CHAT chatInfo._id
           .catch(err => console.error(err))
      }
    },
    onListenersReadMessages({messages, info}){
      console.log('Read messages ', messages ,' of chat ', info)
      if(this.selectedChat._id !== info._id) {
        const index = this.chats.findIndex(chat => chat._id === info._id)
        if(index !== -1){
          const chat = this.chats[index]
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
        const indx = chat.users.findIndex(r => r.user._id === userRole.user)
        if(indx !== -1) {
          chat.users.splice(indx, 1, Object.assign(chat.users[indx], {role: userRole.role}))
          console.debug('Change role ', userRole)
        }
      }
    },

    /* LISTENERS UPDATES */
    _onUpdateUserInOneChat,
    _onUpdateUserInfos,
    onUpdateUserInChatSection,
    onAddFriendShip(friendship){
      let _friendship = mapping(friendship, this.userIdentifier)
      console.debug('onAddFriend : _friendship ', _friendship)
      if(_friendship.user) {
        this.friends.push(_friendship)
        this.friends.sort((f1, f2) => f1.user.userID.localeCompare(f2.user.userID))
      }
    },
    onRemoveFriendShip(friendship){
      let _friendship = mapping(friendship, this.userIdentifier)
      console.debug('onRemoveFriendShip: _friendship ', _friendship)
      if(_friendship.user){
        let id = _friendship.user._id

        let index = this.friends.findIndex(f => f.user._id === id)
        if(index !== -1) this.friends.splice(index, 1) //ok

        this.chats.filter(chat => this._isChatOne(chat.info))
                  .filter(chat => chat.users.find(r => r.user._id  === id))
                  .forEach(chat => chat.users.forEach(r => {
                    r.role = 'reader'
                    r.exitedAt = Date.now()
                  }))
      }
    },
    onDeleteUser(id){
      console.debug('onDeleteUser ', id)

      let index = this.friends.findIndex(f => f.user._id === id)
      if(index !== -1) this.friends.splice(index, 1) //ok

      let chatInd = this.chats.find(chat => {
        let users = chat.users.map(u => u.user._id);
        return this._isChatOne(chat.info) && users.length === 2 && users.includes(id) && users.includes(this.userIdentifier)
      })
      this.chats.splice(chatInd, 1)

      this.chats.filter(chat => this._isChatGroup(chat.info) && chat.users.map(u => u.user._id).includes(id))
                .forEach((chat, ind, array) => {
                  let index = chat.users.findIndex(r => r.user._id === id)
                  if(index !== -1) {
                    let chatWithAdmin = chat.users.filter(u => 'admin' === u.user.role)
                    if(chatWithAdmin.length === chat.users.length - 1) array.splice(ind, 1)
                    else chat.users.splice(index, 1)
                  }
                })
    }
  },
  created() {
    this.pendingRequests = QueuePendingRequests.create()

    this.getFriends()
    this.getChats()

    this.$bus.$on('push-message', this.onListenersPushMessage.bind(this))
    this.$bus.$on('read-message', this.onListenersReadMessages.bind(this))
    this.$bus.$on('chat:change:role', this.onListenerChangeRole.bind(this))

    this.$bus.$on('user:update:info', this.onUpdateUserInChatSection.bind(this))
    this.$bus.$on('friend:add', this.onAddFriendShip.bind(this))
    this.$bus.$on('friend:remove', this.onRemoveFriendShip.bind(this))
    this.$bus.$on('user:delete', this.onDeleteUser.bind(this))
  },
  beforeDestroy() {
    this.pendingRequests.cancelAll('all chats cancel.')
    this.$bus.$off('push-message', this.onListenersPushMessage.bind(this))
    this.$bus.$off('read-message', this.onListenersReadMessages.bind(this))
    this.$bus.$off('chat:change:role', this.onListenerChangeRole.bind(this))

    this.$bus.$off('user:update:info', this.onUpdateUserInChatSection.bind(this))
    this.$bus.$off('friend:add', this.onAddFriendShip.bind(this))
    this.$bus.$off('friend:remove', this.onRemoveFriendShip.bind(this))
    this.$bus.$off('user:delete', this.onDeleteUser.bind(this))
  }
}
</script>

<style  lang="scss" scoped>

$height_items_chat: 700px;

.chat-items-container {
  height: $height_items_chat;
  overflow-y: auto;

  & .chat-item.selected {
    background-color: #b8c6ff;
  }
}

.chat-container {
  background-color: $background-color-chat;
  border-radius: 1.25rem;
  height: $height_items_chat;

}

#chat-items-navigator {
   padding: 2px;
   & > ul {
    margin: 0!important;
    flex-direction: column!important;
    height: 100%;
    width: 100%;
  }
}
.friends-list {

  .friend-item {
    border: 1px solid lightgrey;
    border-radius: 0.25rem;
    box-shadow: 0 0 5px 0 $overlay;
    cursor: pointer;
  }
}
</style>
