<template>
  <div v-if="skeleton" class="one-chat p-3 my-2">
    <b-row align-v="center" >
      <b-col class="pr-0">
        <b-row align-v="center">
          <b-col>
            <b-row align-v="center" >
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
      <b-col class="pl-0 text-right" cols="3">
        <b-button variant="danger">
          <b-skeleton-icon icon="trash-fill" :icon-props="{variant: 'light'}"/>
        </b-button>
      </b-col>
    </b-row>
  </div>
  <div class="one-chat p-3 my-2" v-else-if="value && show">
    <b-row align-v="center" >
      <b-col class="pr-0">
        <router-link :to="{ name: 'chat', params: { chat_id: value._id }}">
          <b-row align-v="center">
            <b-col>
              <b-row align-v="center" >
                <b-col cols="4">
                  <avatar v-model="image" :user="receiverUserIdentifier" @online="lastAccess=0" @offline="lastAccess=$event.offline" :size="50" :group="isChatGroup" />
                </b-col>
                <b-col>
                  <b-row cols="1">
                    <b-col><span>  {{ name }}</span></b-col>
                    <b-col v-if="(!isChatGroup || withAdmin) && lastAccess"><small class="" >{{ lastAccess |dateFormat  }}</small></b-col>
                  </b-row>
                </b-col>
              </b-row>
            </b-col>
            <b-col cols="2" class="text-right" >
              <h4 v-if="numberUnReadMessages"><b-badge pill variant="primary"> {{numberUnReadMessages}} <span class="sr-only"> messaggio non letto </span></b-badge> </h4>
            </b-col>
          </b-row>
        </router-link>
      </b-col>
      <b-col class="pl-0 text-right"  cols="3">
        <b-button :id="removeChatId" variant="danger" @click="removeChat">
          <b-icon-trash-fill />
        </b-button>
        <b-tooltip :target="removeChatId"> Rimuovi chat </b-tooltip>
      </b-col>
    </b-row>
  </div>
</template>

<script>

import {mapGetters} from "vuex";

import ChatUtils from '@components/chats/utils'

export default {
  name: "chat-item",
  props: {
    value: Object,
    skeleton: Boolean
  },
  filters: {
    dateFormat: function (text){
      return dateFormat(text)
    }
  },
  data(){
    return {
      lastAccess: ''
    }
  },
  computed: {
    ...mapGetters(["userIdentifier", "isAdmin"]),

    removeChatId(){
      return 'remove-chat-' + this.value._id
    },

    show(){
      if(this.isChatOne || (this.isChatGroup && this.withAdmin))
        return this.value.messages.length
      return true
    },
    isChatOne(){
      return this._isChatOne(this.value.info)
    },
    isChatGroup(){
      return this._isChatGroup(this.value.info)
    },
    withAdmin(){
      return this._withAdmin(this.value.users)
    },

    numberUnReadMessages(){
      return this.value.messages.filter(m => m.sender?._id !== this.userIdentifier)
                                .filter(m => !m.read.find(r => r.user?._id === this.userIdentifier)).length
    },

    receiverUserIdentifier(){
      if(this.isChatOne || this.withAdmin) return this._baseInfoUser(this.value.info, this.value.users)._id
    },

    image(){
      return this._baseInfoUser(this.value.info, this.value.users).img
    },
    name(){
      return this._baseInfoUser(this.value.info, this.value.users).name
    },
  },
  methods: {
    ...ChatUtils,

    removeChat() {
      this.$emit('remove-chat', this.value._id)
    }
  },
  created() {
    if(this.value) this.lastAccess = this._lastAccess(this.value.info.type, this.value.users)
  }
}
</script>

<style lang="scss" scoped>
.one-chat {
  border: 1px solid lightgrey;
  border-radius: 0.5rem;
  cursor: pointer;
}

</style>