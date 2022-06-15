<template>
  <div :class="classMessage">
    <b-row cols="1">
      <b-col
        v-if="showDestName"
        class="text-left px-1"
      >
        <strong>{{ userSender }}</strong>
      </b-col>
      <b-col :class="classContentMessage">
        <b-row
          cols="1"
          class="mx-1"
        >
          <b-col class="px-0">
            <b-row cols="1">
              <b-col>
                <span>{{ message.content }}</span>
              </b-col>
              <b-col
                v-if="message.attachment"
                class="mt-3"
              >
                <slot
                  name="attachment"
                  :item="message.attachment"
                  :sender="message.sender"
                >
                  <attachment-preview
                    v-if="attachmentApi"
                    :attachment-api="attachmentApi"
                    :attachment="message.attachment"
                  />
                </slot>
              </b-col>
            </b-row>
          </b-col>
          <b-col
            v-if="isMyMessage"
            class="text-right px-0"
          >
            <b-icon-arrow-clockwise
              v-if="inDelivered"
              animation="spin"
              aria-label="in consegna"
            />
            <b-icon-check-all
              v-else-if="isRead"
              aria-label="letto"
            />
            <b-icon-check
              v-else-if="isDelivered"
              aria-label="consegnato"
            />
            <b-icon-exclamation-triangle-fill
              v-else-if="isNotSend"
              variant="danger"
              aria-label="non consegnato"
              @click="reSend"
            />
          </b-col>
        </b-row>
      </b-col>
      <b-col :class="classMessageFooter">
        <small> {{ message.timestamp | dateWithSeconds }}</small>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import { mapGetters } from "vuex"

export default {
    name: "ChatMessage",
    props: {
        value: {
            type: Object,
            required: true
        },
        group: Boolean,
        room: Boolean,

        attachmentApi: {
            type: Function,
            default: undefined
        }
    },
    data() {
        return {
            message: {}
        }
    },
    computed: {
        classMessage() {
            return {
                "message-container": true,
                "my-2 d-flex": true,
                "justify-content-end": this.isMyMessage,
                "justify-content-start": !this.isMyMessage
            }
        },
        classContentMessage() {
            return {
                "message": true,
                "my-message": this.isMyMessage,
                "others-message": !this.isMyMessage
            }
        },
        classMessageFooter() {
            return [
                "px-1",
                this.isMyMessage? "text-right" : "text-left"
            ]
        },


        ...mapGetters({
            userIdentifier: "session/userIdentifier"
        }),

        showDestName() {
            return this.group && !this.isMyMessage
        },
        isMyMessage() {
            return this.message.sender._id === this.userIdentifier
        },
        isRead() {
            return this.message.read && this.message.read.length
        },
        inDelivered() {
            return this.message.delivered === null
        },
        isDelivered() {
            return !this.isRead && this.message.delivered
        },
        isNotSend() {
            return this.message.delivered === false
        },
        userSender() {
            return this.message.sender.userID || "Anonimo"
        },
    },
    watch: {
        value(val) {
            console.debug("Message is changed ", val)
            this.message = val
        }
    },
    created() {
        this.message = this.value
    // console.debug('Messegge ', this.message._id, ' read = ', this.message.read && this.message.read.length > 0, ' delivered = ', this.message.delivered)
    },
    methods: {
        reSend() {
            this.$emit("resend", this.message)
        }
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
