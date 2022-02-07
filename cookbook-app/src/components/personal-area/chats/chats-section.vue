<template>
  <b-container class="my-4 px-4">
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
    <b-row cols="1" align-h="center">
      <chat-item v-if="processing" v-for="i in skeletons" :key="i" skeleton/>
      <chat-item :ref="chatItemRef(chat._id)" class="col" v-for="chat in writeableChats" :key="chat._id"
                 :value="chat" @remove-chat="openDeleteModal"/>
      <p v-if="!processing && writeableChats.length===0">Nessuna chat aperta.</p>
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
import api from '@api'
import {mapping} from "@api/users/friends/utils";
import {mapGetters} from "vuex";
import {_goToChat, _baseInfoUser, _isChatOne, _isChatGroup} from '@components/chats/utils'

import { onUpdateUserInChatSection,  _onUpdateUserInOneChat, _onUpdateUserInfos } from '@components/chats/utils'

export default {
  name: "chats-section",
  data(){
    return {
      skeletons: 3,
      processing: true,

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
    ...mapGetters({
      userIdentifier: 'session/userIdentifier',
      accessToken: 'session/accessToken',
      username: 'session/username',
      isAdmin: 'session/isAdmin'
    }),
    _friends(){
      return this.searchFriend.trim().length ? this.friends.filter(f => f.user.userID.toLowerCase().startsWith(this.searchFriend.toLowerCase()))
                                             : this.friends
    },
    writeableChats(){
      const _writeableChats = this.chats.filter(chat => chat.users.find(r => r.user?._id === this.userIdentifier && r.role !== 'reader'))
      console.debug('writeableChats ', _writeableChats)
      return this.searchChat.trim().length ?
          _writeableChats.map(chat => ({name: this._baseInfoUser(chat.info, chat.users).name, chat}))
                         .filter(o => o.name && o.name.toLowerCase().startsWith(this.searchChat.toLowerCase()))
                         .map(o => o.chat)
          : _writeableChats
    }
  },
  methods: {
    chatItemRef(chatID){
      return 'chat-' + chatID
    },
    _isChatOne,
    _isChatGroup,
    _baseInfoUser,

    getFriends(){
      if(this.isAdmin){
        api.users.getUsers({}, this.accessToken)
                 .then(({data}) => {
                   this.friends = data.items.filter(u => u.signup === 'checked')
                                            .map(user => ({user: {_id: user._id, userID: user.userID, img: user.information.img, country: user.information.country} }))
                   console.debug('users => ', this.friends)
                 })
                //TODO: HANDLER ERROR GET FRIEND IN CHATS SECTION
                .catch(err => console.error(err))
      }else {
        api.friends
           .getFriendOf(this.userIdentifier, this.accessToken, {state: 'accepted'})
           .then(({data}) => {
              this.friends = data.items.map(f => mapping(f, this.userIdentifier))
              console.debug(this.friends)
           })
            //TODO: HANDLER ERROR GET FRIEND IN CHATS SECTION
           .catch(err => console.error(err))
      }
    },

    getChats(){
      api.chats
         .getChats(this.userIdentifier, this.accessToken)
         .then(({data}) => {
            this.chats = data.items
            console.log('Chats = ', this.chats)
            this.chats.forEach(chat => console.debug(chat.users.map(r => r.user?.role)))
         })
         //TODO: HANDLER ERROR GET CHATS
         .catch(err => console.error(err))
         .finally(() => this.processing = false)
    },

    /* ADD CHAT */
    _goToChat,
    addChat(chat){
      console.debug('Add New Chat = ', chat)
      this.chats.push(chat)
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
      }
    },
    onRemoveChat(){
      api.chats
          .removeChat(this.userIdentifier, this.deleteChat.chat._id, this.accessToken)
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
        chat.messages.push(message)
        this.chats.unshift(this.chats.splice(index, 1)[0])
      } else {
        api.chats
           .getChat(this.userIdentifier, chatInfo._id, this.accessToken)
           .then(({data}) => {
              this.chats.unshift(chat)
              console.debug(data.users.map(r => r.user.role))
           })
           //TODO: HANDLER ERROR GET CHAT chatInfo._id
           .catch(err => console.error(err))
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
    this.getFriends()
    this.getChats()

    this.$bus.$on('push-message', this.onListenersPushMessage.bind(this))
    this.$bus.$on('chat:change:role', this.onListenerChangeRole.bind(this))

    this.$bus.$on('user:update:info', this.onUpdateUserInChatSection.bind(this))
    this.$bus.$on('friend:add', this.onAddFriendShip.bind(this))
    this.$bus.$on('friend:remove', this.onRemoveFriendShip.bind(this))
    this.$bus.$on('user:delete', this.onDeleteUser.bind(this))
  },
  beforeDestroy() {
    this.$bus.$off('push-message', this.onListenersPushMessage.bind(this))
    this.$bus.$off('chat:change:role', this.onListenerChangeRole.bind(this))

    this.$bus.$off('user:update:info', this.onUpdateUserInChatSection.bind(this))
    this.$bus.$off('friend:add', this.onAddFriendShip.bind(this))
    this.$bus.$off('friend:remove', this.onRemoveFriendShip.bind(this))
    this.$bus.$off('user:delete', this.onDeleteUser.bind(this))
  }
}
</script>

<style  lang="scss" scoped>
.friends-list {

  .friend-item {
    border: 1px solid lightgrey;
    border-radius: 0.25rem;
    box-shadow: 0px 0px 5px 0px $overlay;
    cursor: pointer;
  }
}
</style>