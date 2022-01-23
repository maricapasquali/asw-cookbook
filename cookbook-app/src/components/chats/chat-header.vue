<template>
  <b-skeleton-wrapper :loading="!value">
    <template #loading>
      <b-container class="chat-header py-4" >
        <b-row align-h="center">
          <b-col cols="4" class="pr-0">
            <b-row align-h="center" align-v="center" cols="2">
              <b-col cols="3"><b-skeleton type="avatar" /></b-col>
              <b-col cols="9"><b-skeleton width="80%" /></b-col>
              <b-col class="mt-1 pl-1" cols="10"> <b-skeleton width="80%"/></b-col>
            </b-row>
          </b-col>
        </b-row>
      </b-container>
    </template>

    <b-row class="chat-header py-3"  align-v="center" align-h="center" cols="1">
      <b-col class="text-center">
        <avatar class="mr-4" v-model="receiverImage" :user="receiverIdentifier" :size="50" :group="isChatGroup"
                @online="onUserEnter" @offline="onUserLeave" />
        <strong class="username">{{ receiverName }}</strong>
      </b-col>
      <b-col v-show="(!isChatGroup || withAdmin) && lastAccess"  class="text-center">
        <p class="last-access mb-0"> {{ lastAccess | dateFormat }} </p>
      </b-col>
    </b-row>
  </b-skeleton-wrapper>

</template>

<script>
import {dateFormat} from "@services/utils";
import {mapGetters} from "vuex";

import ChatUtils from '@components/chats/utils'
import ChatTyping from "./chat-typing";

export default {
  name: "chat-header",
  components: {ChatTyping},
  props: {
    value: Object
  },
  filters: {
    dateFormat
  },
  data(){
    return {
      lastAccess: ''
    }
  },
  watch: {
    value(val, old){
      if(!old) this.setLastAccess(val)
    }
  },
  computed: {
    ...mapGetters(['userIdentifier', 'isAdmin']),
    isChatOne(){
      return this.value && this._isChatOne(this.info)
    },
    isChatGroup(){
      return this.value && this._isChatGroup(this.info)
    },
    withAdmin(){
      return this.value && this._withAdmin(this.users)
    },
    receiverIdentifier(){
      if(this.value &&(this.isChatOne || this.withAdmin)) return this._baseInfoUser(this.info, this.users)._id
    },
    receiverName(){
      return this.value && this._baseInfoUser(this.info, this.users).name
    },
    receiverImage(){
      return this.value && this._baseInfoUser(this.info, this.users).img
    },

    users(){
      return this.value && this.value.users
    },
    info(){
      return this.value && this.value.info
    },
  },
  methods: {
    ...ChatUtils,

    setLastAccess(val){
      if(val) this.lastAccess = this._lastAccess(this.info.type, this.users)
    },

    onUserLeave(user, isLast){
      if(isLast) this.lastAccess = user.offline
      this.$emit('on-user-leave', user._id)
    },
    onUserEnter(user){
      this.lastAccess = 0
      this.$emit('on-user-enter', user._id)
    },

  },
  mounted() {
    this.setLastAccess(this.value)
  },
}
</script>

<style lang="scss" scoped>
.username{
  font-size: 18pt;
}
</style>