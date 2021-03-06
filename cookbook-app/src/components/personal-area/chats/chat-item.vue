<template>
  <div
    v-if="skeleton"
    class="one-chat p-3 my-2"
  >
    <b-row align-v="center">
      <b-col class="pr-0">
        <b-row align-v="center">
          <b-col>
            <b-row align-v="center">
              <b-col cols="2">
                <b-skeleton type="avatar" />
              </b-col>
              <b-col>
                <b-row cols="1">
                  <b-col><span>  <b-skeleton width="100%" /> </span></b-col>
                  <b-col><small>  <b-skeleton width="50%" /></small></b-col>
                </b-row>
              </b-col>
            </b-row>
          </b-col>
        </b-row>
      </b-col>
    </b-row>
    <b-row>
      <b-col class="pl-0 d-flex justify-content-end">
        <b-skeleton type="button" />
      </b-col>
    </b-row>
  </div>
  <div
    v-else-if="value && show"
    class="one-chat p-3"
  >
    <b-row align-v="center">
      <b-col cols="10">
        <b-row align-v="center">
          <b-col cols="4">
            <avatar
              v-model="image"
              :user="receiverUserIdentifier"
              :size="50"
              :group="isChatGroup"
              @online="lastAccess=0"
              @offline="lastAccess=$event.offline"
            />
          </b-col>
          <b-col>
            <b-row cols="1">
              <b-col><span>{{ name }}</span></b-col>
              <b-col v-if="(!isChatGroup || withAdmin) && lastAccess">
                <small class="">{{ lastAccess | date }}</small>
              </b-col>
            </b-row>
          </b-col>
        </b-row>
      </b-col>
      <b-col
        cols="2"
        class="text-right pl-0 pr-3"
      >
        <h4 v-if="numberUnReadMessages">
          <b-badge
            pill
            variant="primary"
          >
            {{ numberUnReadMessages }} <span class="sr-only"> messaggio non letto </span>
          </b-badge>
        </h4>
      </b-col>
    </b-row>
    <b-row>
      <b-col class="pl-0 text-right">
        <b-dropdown
          no-caret
          variant="light"
          right
        >
          <template #button-content>
            <b-icon-three-dots-vertical aria-label="Opzioni chat" />
          </template>
          <b-dropdown-item
            :to="{ name: 'chat', params: { chatId: value._id } }"
            target="_blank"
            @click="redirectOnOtherTab"
          >
            <b-icon-box-arrow-in-up-right /> Apri in un altra scheda
          </b-dropdown-item>
          <b-dropdown-item @click="removeChat">
            <b-icon-trash-fill aria-hidden="true" /> Cancella
          </b-dropdown-item>
        </b-dropdown>
      </b-col>
    </b-row>
  </div>
</template>

<script>

import { mapGetters } from "vuex"

import { ChatMixin } from "@mixins"

export default {
    name: "ChatItem",
    mixins: [ChatMixin],
    props: {
        skeleton: Boolean,
        value: {
            type: Object,
            default: undefined
        }
    },
    data() {
        return {
            lastAccess: ""
        }
    },
    computed: {
        ...mapGetters({
            userIdentifier: "session/userIdentifier",
            isAdmin: "session/isAdmin"
        }),

        show() {
            if (this.isChatOne || (this.isChatGroup && this.withAdmin))
                return this.value.started || this.value.messages?.length
            return true
        },
        isChatOne() {
            return this._isChatOne(this.value.info)
        },
        isChatGroup() {
            return this._isChatGroup(this.value.info)
        },
        withAdmin() {
            return this._withAdmin(this.value.users)
        },

        numberUnReadMessages() {
            return this.value.unreadMessages || this.value.messages?.filter(m => m.sender?._id !== this.userIdentifier)
                .filter(m => !m.read.find(r => r.user?._id === this.userIdentifier))
                .length
        },

        receiverUserIdentifier() {
            return this.isChatOne || this.withAdmin ? this._baseInfoUser(this.value.info, this.value.users)?._id : ""
        },

        image() {
            return this._baseInfoUser(this.value.info, this.value.users).img
        },
        name() {
            return this._baseInfoUser(this.value.info, this.value.users).name
        },
    },
    created() {
        if (this.value) {
            this.lastAccess = this._lastAccess(this.value.info.type, this.value.users)
        }
    },
    methods: {
        redirectOnOtherTab() {
            this.$emit("redirectOtherTab", this.value)
        },
        removeChat() {
            this.$emit("remove-chat", this.value._id)
        },
    }
}
</script>

<style scoped>
/* stylelint-disable no-empty-source */
</style>
