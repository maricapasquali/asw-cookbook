<template>
  <div>
    <chat ref="chat" v-model="chat" :from-link="fromLink" v-show="!notFound"/>
    <center-container v-if="notFound">
      <template #content>
        <not-found asset="chat" />
      </template>
    </center-container>
  </div>
</template>

<script>

import {mapGetters} from "vuex";
import NotFound from "./404";

import ChatMixin from '@mixins/chat.mixin'

export default {
  name: "OneChat",
  mixins: [ChatMixin],
  components: {NotFound},
  data() {
    return {
      chat: null,
      unAuthorized: false,
      notFound: false
    }
  },
  computed: {
    ...mapGetters({
      isLoggedIn: 'session/isLoggedIn'
    }),
    chatID(){
      return this.$route.params.chat_id
    },
    fromLink(){
      return this.$route.params.chat_id != null
    }
  },
  methods: {
    getChat(){
      if(this.isLoggedIn) {
        this.$store.dispatch('chats/one', {chatID: this.chatID })
            .then(({data}) => {
              this.chat = data
              console.debug(this.chat)
            })
            .catch(this.handleRequestErrors.chats.getChat)
            .then(_notFound => this.notFound = _notFound)
      }
      else this.$router.replace({ name: 'login' });
    },
  },

  created() {
    this.getChat()
  }
}
</script>

<style scoped>

</style>