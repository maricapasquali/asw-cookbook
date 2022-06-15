<template>
  <div>
    <chat
      v-show="!notFound"
      ref="chat"
      v-model="chat"
      :from-link="fromLink"
    />
    <center-container v-if="notFound">
      <template #content>
        <not-found asset="chat" />
      </template>
    </center-container>
  </div>
</template>

<script>

import { mapGetters } from "vuex"
import NotFound from "./404"

import { ChatMixin } from "@mixins"

export default {
    name: "OneChat",
    components: { NotFound },
    mixins: [ChatMixin],
    data() {
        return {
            chat: null,
            unAuthorized: false,
            notFound: false
        }
    },
    computed: {
        ...mapGetters({
            isLoggedIn: "session/isLoggedIn"
        }),
        chatID() {
            return this.$route.params.chatId
        },
        fromLink() {
            return this.$route.params.chatId != null
        }
    },

    created() {
        this.getChat()
    },
    methods: {
        getChat() {
            if (this.isLoggedIn) {
                this.$store.dispatch("chats/one", { chatID: this.$route.params.chatId })
                    .then(({ data }) => {
                        console.error("Chat ", data)
                        this.chat = data
                        console.debug(this.chat)
                    })
                    .catch(this.$store.$api.errorsHandler.chats.getChat)
                    .then(_notFound => this.notFound = _notFound)
            } else this.$router.replace({ name: "login" })
        },
    }
}
</script>

<style scoped>
/* stylelint-disable no-empty-source */
</style>
