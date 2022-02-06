<template>
  <div>
    <chat ref="chat" v-model="chat"/>
    <div v-if="unAuthorized"><not-authorized-area/></div>
    <div v-else-if="notFound"><not-found asset="chat" /></div>
  </div>
</template>

<script>
import api from '@api'
import {mapGetters, mapMutations} from "vuex";
import NotFound from "./404";

import { onUpdateUserInOneChat,  _onUpdateUserInOneChat, _onUpdateUserInfos } from '@components/chats/utils'

export default {
  name: "OneChat",
  components: {NotFound},
  data() {
    return {
      chat: null,
      unAuthorized: false,
      notFound: false
    }
  },
  computed: {
    ...mapGetters(["userIdentifier", "accessToken", "socket"]),
  },
  methods: {
    ...mapMutations(["endSession"]),

    getChat(){
      if(this.userIdentifier) {
        api.chats
            .getChat(this.userIdentifier, this.$route.params.chat_id, this.accessToken)
            .then(({data}) => {
              this.chat = data
              console.debug(this.chat)
            })
            .catch((err) => {
              if(err.response){
                switch (err.response.status){
                  case 401: {
                    console.error("UnAuthorized: ", err.response.data)
                    this.endSession()
                    this.$router.replace({ name: 'login' });
                  }
                  break;
                  case 403: this.unAuthorized = true
                    break;
                  case 404: {
                    this.$refs.chat.$el.remove()
                    this.notFound = true
                  }
                  break
                  //TODO: HANDLER ERROR GET CHAT
                  default: break
                }
              }else console.error(err)
            })
      }
      else this.$router.replace({ name: 'login' });
    },

    /* LISTENERS UPDATES */
    _onUpdateUserInOneChat,
    _onUpdateUserInfos,
    onUpdateUserInOneChat
  },

  created() {
    this.getChat()
    this.$bus.$on('user:update:info', this.onUpdateUserInOneChat.bind(this))
  },
  beforeDestroy() {
    this.$bus.$off('user:update:info', this.onUpdateUserInOneChat.bind(this))
  }
}
</script>

<style scoped>

</style>