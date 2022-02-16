<template>
  <div :class="classMessage">
    <b-row cols="1">
      <b-col v-if="showDestName" class="text-left px-1"> <strong>{{ userSender }}</strong> </b-col>
      <b-col :class="classContentMessage">
        <b-row cols="1" class="mx-1">
          <b-col class="px-0">
            <b-row cols="1">
              <b-col>
                <span>{{ message.content }}</span>
              </b-col>
              <b-col class="mt-3" v-if="message.attachment">
                <slot name="attachment" v-bind:item="message.attachment" v-bind:sender="message.sender">
                  <attachment-preview v-if="attachmentApi" :attachment-api="attachmentApi" :attachment="message.attachment"/>
                </slot>
              </b-col>
            </b-row>
          </b-col>
          <b-col v-if="isMyMessage" class="text-right px-0" >
            <b-icon-arrow-clockwise v-if="inDelivered" animation="spin" aria-label="in consegna"/>
            <b-icon-check-all v-else-if="isRead" aria-label="letto"/>
            <b-icon-check v-else-if="isDelivered" aria-label="consegnato"/>
            <b-icon-exclamation-triangle-fill variant="danger" v-else-if="isNotSend" @click="reSend" aria-label="non consegnato" />
          </b-col>
        </b-row>
      </b-col>
      <b-col :class="classMessageFooter">
        <small> {{ message.timestamp | dateFormat }}</small>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import {mapGetters} from "vuex";
export default {
  name: "chat-message",
  props: {
    value: Object,
    group: Boolean,
    room: Boolean,

    attachmentApi: Function
  },
  data(){
    return {
      message: {}
    }
  },
  watch: {
    value(val, old){
      console.log('Message is changed ', val)
      this.message = val
    }
  },
  filters: {
    dateFormat: function (timestamp){
      return dateFormat(timestamp, 'it', true)
    },
    remove(text, attachment){
      return attachment ? text.replace(attachment, ''): text
    }
  },
  computed: {
    classMessage(){
      return {
        'message-container': true,
        'my-2 d-flex': true,
        'justify-content-end': this.isMyMessage,
        'justify-content-start': !this.isMyMessage
      }
    },
    classContentMessage(){
      return {
        'message': true,
        'my-message': this.isMyMessage,
        'others-message': !this.isMyMessage
      }
    },
    classMessageFooter(){
      return [
        'px-1',
        this.isMyMessage? 'text-right' : 'text-left'
      ]
    },


    ...mapGetters({
      userIdentifier: 'session/userIdentifier'
    }),

    showDestName(){
      return this.group && !this.isMyMessage
    },
    isMyMessage(){
      return this.message.sender._id === this.userIdentifier
    },
    isRead(){
      return this.message.read && this.message.read.length
    },
    inDelivered(){
      return this.message.delivered === null
    },
    isDelivered(){
      return !this.isRead && this.message.delivered
    },
    isNotSend(){
      return this.message.delivered === false
    },
    userSender(){
      return this.message.sender.userID || 'Anonimo'
    },
  },
  methods: {
    reSend(){
      this.$emit('resend', this.message)
    }
  },
  created() {
    this.message = this.value
    // console.debug('Messegge ', this.message._id, ' read = ', this.message.read && this.message.read.length > 0, ' delivered = ', this.message.delivered)
  }
}
</script>

<style lang="scss" scoped>

/* SINGLE MESSAGE */
.message-container {

  & .message {
    border-radius:10px;
    padding: 10px;

    white-space: pre-line;
    word-break: break-word;
  }

  & .message.my-message  {
    background-color: $background-color-my-message;
    color: white;
    > pre{
      color: white;
    }
  }
  & .message.others-message {
    background-color: $background-color-others-message;
    color: black;
    > pre{
      color: black;
    }
  }
}

</style>